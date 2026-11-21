import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate, type AuthenticatedRequest } from "../../middleware/authenticate";
import { orchestrateSearch } from "../../services/searchOrchestrator";
import { rankJobs } from "../../services/relevanceScorer";
import { extractJobCriteria } from "../../ai/extractJobCriteria";

export const jobsRouter = Router();

// --- GET /api/jobs --- list stored jobs with optional filters
jobsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const skip = (page - 1) * limit;

    const [jobs, total] = await prisma.$transaction([
      prisma.job.findMany({
        where: { status: "active" },
        orderBy: { lastVerifiedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where: { status: "active" } }),
    ]);

    res.json({ jobs, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// --- GET /api/jobs/saved --- list saved jobs (requires auth)
jobsRouter.get(
  "/saved",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const savedJobs = await prisma.savedJob.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { createdAt: "desc" },
      });
      res.json({ jobs: savedJobs.map((s) => s.job) });
    } catch (err) {
      next(err);
    }
  }
);

// --- GET /api/jobs/:id --- get single job
jobsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/jobs/search --- search with criteria object
jobsRouter.post(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, options } = req.body as {
        message?: string;
        options?: { onlyNew?: boolean; recentOnly?: boolean; limit?: number };
      };

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      const result = await orchestrateSearch(message, options ?? {});
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// --- POST /api/jobs/:id/save --- save a job (requires auth)
jobsRouter.post(
  "/:id/save",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const jobId = req.params.id;

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return res.status(404).json({ error: "Job not found" });

      const saved = await prisma.savedJob.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: {},
        create: { userId, jobId },
      });

      res.status(201).json({ saved });
    } catch (err) {
      next(err);
    }
  }
);

// --- DELETE /api/jobs/:id/save --- unsave a job (requires auth)
jobsRouter.delete(
  "/:id/save",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const jobId = req.params.id;

      await prisma.savedJob.deleteMany({ where: { userId, jobId } });
      res.json({ message: "Job removed from saved" });
    } catch (err) {
      next(err);
    }
  }
);
