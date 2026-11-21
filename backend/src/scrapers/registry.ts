import type { JobSource, RawJob, JobSearchCriteria } from "../types";
import { AdzunaSource } from "./api/adzuna.source";
import { RemoteOKSource } from "./api/remoteok.source";
import { WorkIndiaPlaywrightSource } from "./playwright/workindia.source";

/**
 * Centralized registry of all job sources.
 * Add new sources here — they will automatically participate in searches.
 */
const sources: JobSource[] = [
  new AdzunaSource(),
  new RemoteOKSource(),
  new WorkIndiaPlaywrightSource(),
];

/**
 * Run all sources in parallel, collect results, and return raw jobs.
 * Individual source failures are logged but do not stop other sources.
 */
export async function discoverJobsFromSources(
  criteria: JobSearchCriteria,
  queries: string[]
): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    sources.map((source) => source.searchJobs(criteria, queries))
  );

  const allJobs: RawJob[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(
        `[Registry] ${sources[index].name}: ${result.value.length} jobs`
      );
      allJobs.push(...result.value);
    } else {
      console.error(
        `[Registry] ${sources[index].name} failed:`,
        result.reason
      );
    }
  });

  return allJobs;
}

/** List all registered source names */
export function getRegisteredSources(): string[] {
  return sources.map((s) => s.name);
}
