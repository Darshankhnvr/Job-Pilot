import axios from "axios";
import { env } from "../../config/env";
import type { JobSource, RawJob, JobSearchCriteria } from "../../types";

interface AdzunaResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  redirect_url?: string;
  created?: string;
}

interface AdzunaResponse {
  results: AdzunaResult[];
}

/**
 * Adzuna Job API scraper.
 * Docs: https://developer.adzuna.com/
 * Register at: https://developer.adzuna.com/signup
 * Free tier: 250 requests/month
 */
export class AdzunaSource implements JobSource {
  name = "adzuna";

  private baseUrl = "https://api.adzuna.com/v1/api/jobs";
  private country = "in"; // India

  async searchJobs(
    criteria: JobSearchCriteria,
    queries: string[]
  ): Promise<RawJob[]> {
    if (!env.adzunaAppId || !env.adzunaAppKey) {
      console.warn("[Adzuna] Skipping — ADZUNA_APP_ID or ADZUNA_APP_KEY not set");
      return [];
    }

    const allJobs: RawJob[] = [];
    const seen = new Set<string>();

    // Use up to 3 queries to avoid rate-limiting
    for (const query of queries.slice(0, 3)) {
      try {
        const url = `${this.baseUrl}/${this.country}/search/1`;
        const params: Record<string, string | number> = {
          app_id: env.adzunaAppId,
          app_key: env.adzunaAppKey,
          what: query,
          results_per_page: 20,
          content_type: "application/json",
        };

        if (criteria.locations.length > 0) {
          params.where = criteria.locations
            .filter((l) => l.toLowerCase() !== "remote india")
            .join(" ");
        }

        if (criteria.salaryMin) {
          params.salary_min = criteria.salaryMin;
        }

        const response = await axios.get<AdzunaResponse>(url, {
          params,
          timeout: 15000,
        });

        const results = response.data?.results ?? [];

        for (const r of results) {
          if (!r.redirect_url || seen.has(r.id)) continue;
          seen.add(r.id);

          // Map contract_time to employment type
          let employmentType: string | undefined;
          if (r.contract_time === "full_time") employmentType = "Full-time";
          else if (r.contract_time === "part_time") employmentType = "Part-time";

          allJobs.push({
            title: r.title ?? "Unknown Title",
            company: r.company?.display_name ?? "Unknown Company",
            location: r.location?.display_name ?? "Unknown Location",
            description: r.description ?? "",
            salaryMin: r.salary_min ? Math.round(r.salary_min) : undefined,
            salaryMax: r.salary_max ? Math.round(r.salary_max) : undefined,
            employmentType,
            skills: [],
            source: this.name,
            jobUrl: r.redirect_url,
            postedAt: r.created ? new Date(r.created) : undefined,
          });
        }
      } catch (err) {
        console.error(`[Adzuna] Error fetching query "${query}":`, err);
      }
    }

    return allJobs;
  }
}
