import type { JobSearchCriteria, JobRelevanceScore } from "../types";

interface ScoredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: unknown;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: string | null;
  employmentType: string | null;
}

/**
 * Relevance scoring engine.
 * Weights: role 30%, skills 25%, location 20%, experience 15%, salary 10%
 */
export function scoreJob(
  job: ScoredJob,
  criteria: JobSearchCriteria
): JobRelevanceScore {
  let score = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // --- Role Match (30%) ---
  const titleLower = job.title.toLowerCase();
  const roleMatch =
    criteria.roles.length === 0
      ? 1
      : Math.max(
          ...criteria.roles.map((r) =>
            titleLower.includes(r.toLowerCase()) ? 1 : 0
          )
        );
  score += roleMatch * 30;

  // --- Skills Match (25%) ---
  const jobSkills: string[] = Array.isArray(job.skills)
    ? (job.skills as string[]).map((s) => s.toLowerCase())
    : [];
  const descLower = "";

  if (criteria.skills.length === 0) {
    score += 25; // No specific skills required → full score
  } else {
    for (const skill of criteria.skills) {
      const skillLower = skill.toLowerCase();
      if (
        jobSkills.some((s) => s.includes(skillLower)) ||
        descLower.includes(skillLower) ||
        titleLower.includes(skillLower)
      ) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
    const skillScore = criteria.skills.length > 0
      ? matchedSkills.length / criteria.skills.length
      : 1;
    score += skillScore * 25;
  }

  // --- Location Match (20%) ---
  const locationLower = job.location.toLowerCase();
  let locationScore = 0;

  if (criteria.locations.length === 0) {
    locationScore = 1;
  } else {
    for (const loc of criteria.locations) {
      if (locationLower.includes(loc.toLowerCase())) {
        locationScore = 1;
        break;
      }
    }
    // Remote preference bonus
    if (
      locationScore === 0 &&
      criteria.remotePreference &&
      locationLower.includes("remote")
    ) {
      locationScore = 1;
    }
  }
  score += locationScore * 20;

  // --- Experience Match (15%) ---
  if (!criteria.experience) {
    score += 15;
  } else {
    const expText = (job.experience ?? job.title).toLowerCase();

    // Try to extract numbers from experience string
    const numbers = expText.match(/\d+/g)?.map(Number) ?? [];
    const jobExpMin = numbers[0] ?? 0;
    const jobExpMax = numbers[1] ?? jobExpMin;

    const { min = 0, max = 50 } = criteria.experience;

    // Ranges overlap?
    if (jobExpMin <= max && jobExpMax >= min) {
      score += 15;
    } else {
      // Partial — penalize based on how far off
      const distance = Math.min(
        Math.abs(jobExpMin - max),
        Math.abs(jobExpMax - min)
      );
      score += Math.max(0, 15 - distance * 3);
    }
  }

  // --- Salary Match (10%) ---
  if (!criteria.salaryMin) {
    score += 10;
  } else if (job.salaryMin !== null && job.salaryMin >= criteria.salaryMin) {
    score += 10;
  } else if (job.salaryMax !== null && job.salaryMax >= criteria.salaryMin) {
    score += 5; // Partial
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, score)));

  // Generate explanation
  const explanationParts: string[] = [];
  if (roleMatch === 1) explanationParts.push("strong role match");
  if (matchedSkills.length > 0) {
    explanationParts.push(`matches skills: ${matchedSkills.slice(0, 3).join(", ")}`);
  }
  if (locationScore === 1) explanationParts.push("location match");
  if (missingSkills.length > 0) {
    explanationParts.push(`missing: ${missingSkills.slice(0, 2).join(", ")}`);
  }

  const explanation =
    explanationParts.length > 0
      ? explanationParts.join("; ")
      : finalScore >= 60
      ? "Reasonable match for your requirements"
      : "Limited match for your criteria";

  return {
    jobId: job.id,
    relevanceScore: finalScore,
    matchedSkills,
    missingSkills,
    explanation,
  };
}

/**
 * Score and sort a list of jobs by relevance.
 * Returns jobs with their scores, sorted descending.
 */
export function rankJobs<T extends ScoredJob>(
  jobs: T[],
  criteria: JobSearchCriteria
): Array<T & JobRelevanceScore> {
  return jobs
    .map((job) => ({ ...job, ...scoreJob(job, criteria) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
