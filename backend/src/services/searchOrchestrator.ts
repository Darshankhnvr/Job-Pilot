import { extractJobCriteria } from "../ai/extractJobCriteria";
import { generateSearchQueries } from "../ai/generateSearchQueries";
import { discoverJobsFromSources } from "../scrapers/registry";
import { normalizeJobs } from "./normalizer";
import { persistJobs, queryStoredJobs } from "../repositories/job.repository";
import { rankJobs } from "./relevanceScorer";
import type { JobSearchCriteria } from "../types";
import { env } from "../config/env";

export interface SearchOptions {
  /** If true, only return jobs not seen before by this user */
  onlyNew?: boolean;
  /** If true, only return jobs posted in the last 24 hours */
  recentOnly?: boolean;
  /** IDs to exclude from results (jobs already shown to user) */
  excludeIds?: string[];
  limit?: number;
}

export interface SearchResult {
  criteria: JobSearchCriteria;
  queries: string[];
  jobs: ReturnType<typeof rankJobs>[number][];
  totalFound: number;
  fromDb: number;
  fromSources: number;
  newJobs: number;
}

/**
 * Main search orchestrator.
 *
 * Strategy (database-first):
 * 1. Extract criteria from natural language (or accept pre-parsed criteria)
 * 2. Query PostgreSQL for recent matching jobs
 * 3. If DB has fresh results, reuse them
 * 4. Otherwise, discover from external sources
 * 5. Normalize, deduplicate, persist
 * 6. Merge DB + fresh results
 * 7. Rank by relevance and return
 */
export async function orchestrateSearch(
  message: string,
  options: SearchOptions = {},
  existingCriteria?: JobSearchCriteria
): Promise<SearchResult> {
  const limit = options.limit ?? 25;

  // Step 1: Extract criteria
  const criteria =
    existingCriteria ?? (await extractJobCriteria(message));

  // Step 2: Generate search queries
  const queries = await generateSearchQueries(criteria);
  console.log("[Orchestrator] Queries:", queries);

  // Step 3: Query PostgreSQL first
  const dbJobs = await queryStoredJobs({
    roles: criteria.roles,
    locations: criteria.locations,
    skills: criteria.skills,
    employmentType: criteria.employmentType,
    remotePreference: criteria.remotePreference,
    salaryMin: criteria.salaryMin,
    companyPreference: criteria.companyPreference,
    limit: limit * 2, // Fetch more from DB, rank + truncate
    excludeIds: options.excludeIds,
    onlyNew: options.onlyNew,
    postedAfter: options.recentOnly
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : undefined,
  });

  console.log(`[Orchestrator] DB hit: ${dbJobs.length} jobs`);

  // Step 4: Decide if we need fresh external data
  const needsFresh =
    dbJobs.length < 5 ||
    dbJobs.some(
      (j) =>
        (Date.now() - j.lastVerifiedAt.getTime()) / 3600000 >
        env.jobFreshnessRefreshHours
    );

  let freshJobCount = 0;
  let newJobCount = 0;

  if (needsFresh) {
    console.log("[Orchestrator] Fetching from external sources...");

    // Step 5: Discover from scrapers
    const rawJobs = await discoverJobsFromSources(criteria, queries);
    const normalizedJobs = normalizeJobs(rawJobs);

    // Step 6: Persist (deduplication handled by upsert on normalizedUrl)
    const { inserted, updated } = await persistJobs(normalizedJobs);
    freshJobCount = rawJobs.length;
    newJobCount = inserted;

    console.log(
      `[Orchestrator] Persisted: ${inserted} new, ${updated} updated`
    );
  }

  // Step 7: Re-query to get latest (now includes fresh jobs)
  const finalDbJobs = await queryStoredJobs({
    roles: criteria.roles,
    locations: criteria.locations,
    skills: criteria.skills,
    employmentType: criteria.employmentType,
    remotePreference: criteria.remotePreference,
    salaryMin: criteria.salaryMin,
    companyPreference: criteria.companyPreference,
    limit: limit * 2,
    excludeIds: options.excludeIds,
    onlyNew: options.onlyNew,
    postedAfter: options.recentOnly
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : undefined,
  });

  // Step 8: Rank by relevance
  const ranked = rankJobs(finalDbJobs, criteria).slice(0, limit);

  return {
    criteria,
    queries,
    jobs: ranked,
    totalFound: ranked.length,
    fromDb: dbJobs.length,
    fromSources: freshJobCount,
    newJobs: newJobCount,
  };
}
