import { prisma } from "../config/prisma";
import type { Job } from "../types";
import { env } from "../config/env";

/**
 * Upsert a single normalized job into PostgreSQL.
 * Uses normalizedUrl as the deduplication key.
 * Returns the stored job ID and whether it was newly inserted.
 */
export async function upsertJob(
  job: Job
): Promise<{ id: string; isNew: boolean }> {
  const existing = await prisma.job.findUnique({
    where: { normalizedUrl: job.normalizedUrl },
    select: { id: true },
  });

  if (existing) {
    // Update verification timestamp and refresh description
    await prisma.job.update({
      where: { id: existing.id },
      data: {
        lastVerifiedAt: new Date(),
        description: job.description || undefined,
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        skills: job.skills as unknown as never,
        status: "active",
      },
    });
    return { id: existing.id, isNew: false };
  }

  const created = await prisma.job.create({
    data: {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      experience: job.experience,
      employmentType: job.employmentType,
      skills: job.skills as unknown as never,
      source: job.source,
      jobUrl: job.jobUrl,
      normalizedUrl: job.normalizedUrl,
      postedAt: job.postedAt,
    },
    select: { id: true },
  });

  return { id: created.id, isNew: true };
}

/**
 * Persist an array of normalized jobs.
 * Returns counts of new vs updated records.
 */
export async function persistJobs(
  jobs: Job[]
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const job of jobs) {
    try {
      const { isNew } = await upsertJob(job);
      if (isNew) inserted++;
      else updated++;
    } catch (err) {
      console.error(`[JobRepo] Failed to upsert job "${job.title}":`, err);
    }
  }

  return { inserted, updated };
}

/**
 * Query jobs from the database that match the given criteria.
 * Uses a freshness policy to decide if stored data is current.
 */
export async function queryStoredJobs(params: {
  roles: string[];
  locations: string[];
  skills: string[];
  employmentType?: string;
  remotePreference?: boolean;
  salaryMin?: number;
  companyPreference?: string;
  limit?: number;
  excludeIds?: string[];
  onlyNew?: boolean;
  postedAfter?: Date;
}) {
  const {
    roles,
    locations,
    skills,
    employmentType,
    remotePreference,
    salaryMin,
    companyPreference,
    limit = 50,
    excludeIds = [],
    onlyNew,
    postedAfter,
  } = params;

  const freshnessCutoff = new Date(
    Date.now() - env.jobFreshnessRefreshHours * 60 * 60 * 1000
  );

  const jobs = await prisma.job.findMany({
    where: {
      status: "active",
      lastVerifiedAt: { gte: freshnessCutoff },
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
      postedAt: onlyNew || postedAfter ? { gte: postedAfter ?? new Date(Date.now() - 24 * 60 * 60 * 1000) } : undefined,

      // Role / title matching (OR across roles)
      AND: [
        roles.length > 0
          ? {
              OR: roles.map((r) => ({
                title: { contains: r, mode: "insensitive" as const },
              })),
            }
          : {},

        // Location matching
        locations.length > 0
          ? {
              OR: [
                ...locations.map((l) => ({
                  location: { contains: l, mode: "insensitive" as const },
                })),
                ...(remotePreference
                  ? [{ location: { contains: "remote", mode: "insensitive" as const } }]
                  : []),
              ],
            }
          : {},

        // Employment type
        employmentType ? { employmentType } : {},

        // Salary filter
        salaryMin ? { salaryMin: { gte: salaryMin } } : {},

        // Company preference
        companyPreference
          ? { company: { contains: companyPreference, mode: "insensitive" as const } }
          : {},
      ],
    },
    orderBy: { lastVerifiedAt: "desc" },
    take: limit,
  });

  return jobs;
}

/**
 * Check if a job needs refresh based on freshness policy.
 */
export function needsRefresh(lastVerifiedAt: Date): boolean {
  const ageHours =
    (Date.now() - lastVerifiedAt.getTime()) / (1000 * 60 * 60);
  return ageHours > env.jobFreshnessRefreshHours;
}
