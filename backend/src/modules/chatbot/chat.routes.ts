import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { authenticate, type AuthenticatedRequest } from "../../middleware/authenticate";
import { orchestrateSearch } from "../../services/searchOrchestrator";
import { extractJobCriteria } from "../../ai/extractJobCriteria";
import type { JobSearchCriteria } from "../../types";

export const chatRouter = Router();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationState {
  criteria: JobSearchCriteria | null;
  messages: ChatMessage[];
  shownJobIds: string[];
}

// In-memory session store (per userId → state)
// In production this would be Redis-backed
const sessions = new Map<string, ConversationState>();

function getSession(userId: string): ConversationState {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      criteria: null,
      messages: [],
      shownJobIds: [],
    });
  }
  return sessions.get(userId)!;
}

/** Merge new criteria over existing session criteria for refinement */
function mergeCriteria(
  existing: JobSearchCriteria | null,
  updated: JobSearchCriteria
): JobSearchCriteria {
  if (!existing) return updated;

  return {
    roles: updated.roles.length > 0 ? updated.roles : existing.roles,
    locations: updated.locations.length > 0 ? updated.locations : existing.locations,
    skills: updated.skills.length > 0 ? updated.skills : existing.skills,
    experience: updated.experience ?? existing.experience,
    employmentType: updated.employmentType ?? existing.employmentType,
    salaryMin: updated.salaryMin ?? existing.salaryMin,
    companyPreference: updated.companyPreference ?? existing.companyPreference,
    remotePreference: updated.remotePreference ?? existing.remotePreference,
  };
}

/** Detect if user is refining (not starting a new search) */
function isRefinement(message: string): boolean {
  const refinementPhrases = [
    "only",
    "exclude",
    "remove",
    "filter",
    "show me",
    "what about",
    "also",
    "instead",
    "more than",
    "less than",
    "above",
    "below",
    "just",
  ];
  const lower = message.toLowerCase();
  return refinementPhrases.some((p) => lower.includes(p));
}

/**
 * POST /api/chat
 * Accepts: { message: string }
 * Returns: { reply: string, jobs: Job[], criteria: JobSearchCriteria }
 */
chatRouter.post(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const message = req.body?.message as string;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: "message is required" });
      }

      const session = getSession(userId);
      session.messages.push({ role: "user", content: message });

      // Extract new criteria from the message
      const newCriteria = await extractJobCriteria(message);

      // Decide: refinement of existing search or new search?
      let mergedCriteria: JobSearchCriteria;
      let isRefining = false;

      if (session.criteria && isRefinement(message)) {
        mergedCriteria = mergeCriteria(session.criteria, newCriteria);
        isRefining = true;
      } else {
        mergedCriteria = newCriteria;
        // New search — reset shown jobs
        session.shownJobIds = [];
      }

      session.criteria = mergedCriteria;

      // Orchestrate the search
      const result = await orchestrateSearch(
        message,
        {
          excludeIds: session.shownJobIds,
          limit: 10,
        },
        mergedCriteria
      );

      // Track shown job IDs
      result.jobs.forEach((j) => {
        if (!session.shownJobIds.includes(j.id)) {
          session.shownJobIds.push(j.id);
        }
      });

      // Save search to history
      await prisma.searchHistory.create({
        data: {
          userId,
          searchQuery: message,
          searchFilters: JSON.parse(JSON.stringify(mergedCriteria)),
        },
      });


      // Compose assistant reply
      const { jobs } = result;
      let reply: string;

      if (jobs.length === 0) {
        reply = isRefining
          ? "I've updated the filters but couldn't find matching jobs with those criteria. Try broadening the requirements?"
          : "I couldn't find matching jobs right now. Try different keywords or locations.";
      } else {
        const intro = isRefining
          ? `I've updated the filters. Here are ${jobs.length} matching opportunities:`
          : `I found ${jobs.length} matching opportunities${result.newJobs > 0 ? ` (${result.newJobs} newly discovered)` : ""}:`;

        const topJob = jobs[0];
        reply = `${intro}\n\nTop match: **${topJob.title}** at **${topJob.company}** (${topJob.location}) — relevance score: ${topJob.relevanceScore}/100`;
      }

      session.messages.push({ role: "assistant", content: reply });

      res.json({
        reply,
        jobs,
        criteria: mergedCriteria,
        queries: result.queries,
        stats: {
          totalFound: result.totalFound,
          newJobs: result.newJobs,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /api/chat/history — retrieve message history */
chatRouter.get(
  "/history",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const session = getSession(userId);
      res.json({ messages: session.messages });
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /api/chat/reset — clear session */
chatRouter.delete(
  "/reset",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      sessions.delete(userId);
      res.json({ message: "Session cleared" });
    } catch (err) {
      next(err);
    }
  }
);
