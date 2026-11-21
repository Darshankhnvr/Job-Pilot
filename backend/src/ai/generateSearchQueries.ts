import { llm } from "./llm";
import { type JobSearchCriteria } from "../types";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const QUERY_GEN_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a job search query generator.
Given structured job search criteria, generate 4-6 diverse natural search query strings
that would be used to search for matching jobs on job portals.

Rules:
- Each query should be short (3-7 words).
- Vary the phrasing: use different synonyms for roles.
- Include location in some queries.
- Include experience level (fresher, junior, senior) where relevant.
- Return ONLY a JSON array of strings.
- No explanations, no markdown, just a JSON array.

Example output: ["Node.js Developer Bangalore", "Backend Engineer Remote India", "Junior Node Developer Entry Level"]`,
  ],
  [
    "human",
    `Criteria: {criteria}`,
  ],
]);

export async function generateSearchQueries(
  criteria: JobSearchCriteria
): Promise<string[]> {
  try {
    const response = await QUERY_GEN_PROMPT.pipe(llm).invoke({
      criteria: JSON.stringify(criteria, null, 2),
    });

    const content = String(response.content).trim();

    // Parse the JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Fallback: build basic queries from criteria
      return buildFallbackQueries(criteria);
    }

    const queries = JSON.parse(jsonMatch[0]) as string[];
    return Array.isArray(queries) ? queries.slice(0, 6) : buildFallbackQueries(criteria);
  } catch {
    return buildFallbackQueries(criteria);
  }
}

function buildFallbackQueries(criteria: JobSearchCriteria): string[] {
  const queries: string[] = [];
  const roles = criteria.roles.length > 0 ? criteria.roles : ["Developer"];
  const locations = criteria.locations.length > 0 ? criteria.locations : [];

  for (const role of roles.slice(0, 2)) {
    if (locations.length > 0) {
      queries.push(`${role} ${locations[0]}`);
    }
    queries.push(`${role} ${criteria.experience?.max === 1 ? "Fresher" : ""}`);
    if (criteria.remotePreference) {
      queries.push(`${role} Remote`);
    }
  }

  return queries.filter(Boolean).slice(0, 6);
}
