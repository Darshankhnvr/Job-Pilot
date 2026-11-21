import { URL } from "url";
import type { RawJob, Job } from "../types";

/**
 * Normalize a raw job URL to a canonical form for deduplication.
 * Strips UTM params, session tokens, trailing slashes, etc.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);

    // Remove common tracking/session params
    const removeParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "ref",
      "source",
      "sid",
      "token",
      "sessionId",
    ];
    removeParams.forEach((p) => url.searchParams.delete(p));

    // Normalize: lowercase host, remove trailing slash
    const normalized = `${url.protocol}//${url.hostname}${url.pathname.replace(
      /\/$/,
      ""
    )}${url.search}`;

    return normalized.toLowerCase();
  } catch {
    // If URL is malformed, use the raw value lowercase-trimmed
    return rawUrl.toLowerCase().trim();
  }
}

/**
 * Extract experience string from criteria-like text.
 */
function normalizeExperience(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.trim();
}

/**
 * Normalize a raw job object from any source into the canonical Job shape.
 */
export function normalizeJob(raw: RawJob): Job | null {
  if (!raw.jobUrl) {
    return null; // Cannot store a job without a URL
  }

  const normalizedUrl = normalizeUrl(raw.jobUrl);

  return {
    title: (raw.title ?? "Unknown Title").trim(),
    company: (raw.company ?? "Unknown Company").trim(),
    location: (raw.location ?? "Unknown Location").trim(),
    description: (raw.description ?? "").trim(),
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    experience: normalizeExperience(raw.experience),
    employmentType: raw.employmentType,
    skills: Array.isArray(raw.skills) ? raw.skills.filter(Boolean) : [],
    source: raw.source,
    jobUrl: raw.jobUrl,
    normalizedUrl,
    postedAt: raw.postedAt,
  };
}

/**
 * Normalize an array of raw jobs, filtering out invalid ones.
 */
export function normalizeJobs(rawJobs: RawJob[]): Job[] {
  return rawJobs
    .map(normalizeJob)
    .filter((j): j is Job => j !== null);
}
