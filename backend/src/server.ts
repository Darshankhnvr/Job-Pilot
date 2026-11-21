import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    console.warn("⚠️  Starting without DB — some features will be unavailable");
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`🚀 JobPilot backend running on http://localhost:${env.port}`);
    console.log(`📊 Environment: ${env.nodeEnv}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received — shutting down gracefully");
    await prisma.$disconnect();
    process.exit(0);
  });
}

main();