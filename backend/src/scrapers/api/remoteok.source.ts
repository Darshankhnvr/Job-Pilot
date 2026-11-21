import axios from "axios";
import type { JobSource, RawJob, JobSearchCriteria } from "../../types";

interface RemoteOKJob {
  id?: string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  url?: string;
  date?: string;
}

/**
 * RemoteOK public API scraper.
 * API: https://remoteok.com/api
 * No authentication required. Rate limit: be respectful.
 * Returns remote-first job listings.
 */
export class RemoteOKSource implements JobSource {
  name = "remoteok";

  async searchJobs(
    criteria: JobSearchCriteria,
    queries: string[]
  ): Promise<RawJob[]> {
    // RemoteOK is remote-only — skip if user explicitly wants onsite
    if (criteria.remotePreference === false) {
      return [];
    }

    try {
      const response = await axios.get<RemoteOKJob[]>(
        "https://remoteok.com/api",
        {
          headers: {
            "User-Agent": "JobPilot-AI/1.0 (job discovery platform)",
          },
          timeout: 20000,
        }
      );

      // RemoteOK includes a "legal" header as the first element
      const rawJobs = Array.isArray(response.data)
        ? response.data.filter((j) => j.id !== undefined)
        : [];

      // Filter by query relevance
      const keywords = [
        ...queries.flatMap((q) => q.toLowerCase().split(/\s+/)),
        ...criteria.roles.map((r) => r.toLowerCase()),
        ...criteria.skills.map((s) => s.toLowerCase()),
      ];

      const filtered = rawJobs.filter((job) => {
        const text = `${job.position ?? ""} ${job.description ?? ""} ${
          (job.tags ?? []).join(" ")
        }`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      });

      return filtered.slice(0, 30).map((job) => ({
        title: job.position ?? "Unknown Title",
        company: job.company ?? "Unknown Company",
        location: job.location ?? "Remote",
        description: job.description ?? "",
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        employmentType: "Full-time",
        skills: Array.isArray(job.tags) ? job.tags.slice(0, 10) : [],
        source: this.name,
        jobUrl: job.url ?? `https://remoteok.com/remote-jobs/${job.id}`,
        postedAt: job.date ? new Date(job.date) : undefined,
      }));
    } catch (err) {
      console.error("[RemoteOK] Error fetching jobs:", err);
      return [];
    }
  }
}
