import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env";

export const llm = new ChatGroq({
  apiKey: env.groqApiKey,
  model: env.groqModel,
  temperature: 0,
});