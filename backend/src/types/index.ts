import { z } from "zod";

/** Common Job shape used throughout the application */
export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  employmentType?: string;
  skills: string[];
  source: string;
  jobUrl: string;
  normalizedUrl: string;
  postedAt?: Date;
}

/** Raw job data as returned by scrapers (before normalization) */
export interface RawJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  employmentType?: string;
  skills?: string[];
  source: string;
  jobUrl?: string;
  postedAt?: Date;
}

/** Structured job search criteria extracted from user natural language */
export const jobSearchCriteriaSchema = z.object({
  roles: z
    .array(z.string())
    .default([])
    .describe('Job titles, e.g. ["Node.js Developer", "Backend Developer"]'),
  locations: z
    .array(z.string())
    .default([])
    .describe('Cities or regions, e.g. ["Bangalore", "Remote India"]'),
  experience: z
    .object({
      min: z.number().min(0).optional().describe("Minimum years of experience"),
      max: z.number().min(0).optional().describe("Maximum years of experience"),
    })
    .optional(),
  skills: z
    .array(z.string())
    .default([])
    .describe('Technologies, e.g. ["Node.js", "MongoDB"]'),
  employmentType: z
    .string()
    .optional()
    .describe('One of: "Full-time", "Part-time", "Internship", "Contract", "Freelance"'),
  salaryMin: z.number().optional().describe("Minimum annual salary in INR"),
  companyPreference: z
    .string()
    .optional()
    .describe('Company type, e.g. "Product-based", "Startup", "MNC"'),
  remotePreference: z.boolean().optional(),
});

export type JobSearchCriteria = z.infer<typeof jobSearchCriteriaSchema>;

/** Relevance score result for a single job */
export interface JobRelevanceScore {
  jobId: string;
  relevanceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

/** Scraper interface — every job source must implement this */
export interface JobSource {
  name: string;
  searchJobs(criteria: JobSearchCriteria, queries: string[]): Promise<RawJob[]>;
}
