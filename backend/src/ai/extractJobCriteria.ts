import { llm } from "./llm";
import { intentExtractionPrompt } from "./prompts/intentExtraction";
import { jobSearchCriteriaSchema, type JobSearchCriteria } from "../types";

const structuredLlm = llm.withStructuredOutput(jobSearchCriteriaSchema, {
  name: "extract_job_criteria",
});

const chain = intentExtractionPrompt.pipe(structuredLlm);

export async function extractJobCriteria(
  message: string
): Promise<JobSearchCriteria> {
  const raw = await chain.invoke({ message });
  // withStructuredOutput strips Zod defaults, so we re-parse to apply them.
  return jobSearchCriteriaSchema.parse(raw);
}