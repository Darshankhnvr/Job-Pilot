import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  // Groq / LLM
  groqApiKey: required("GROQ_API_KEY"),
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",

  // Database
  databaseUrl: required("DATABASE_URL"),

  // Authentication
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // Job APIs
  adzunaAppId: process.env.ADZUNA_APP_ID ?? "",
  adzunaAppKey: process.env.ADZUNA_APP_KEY ?? "",

  // Job freshness thresholds (hours)
  jobFreshnessReuseHours: Number(process.env.JOB_FRESHNESS_REUSE_HOURS ?? 6),
  jobFreshnessRefreshHours: Number(process.env.JOB_FRESHNESS_REFRESH_HOURS ?? 24),
};