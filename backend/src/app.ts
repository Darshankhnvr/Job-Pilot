import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";

import { healthRouter } from "./modules/health/health.routes";
import { aiRouter } from "./modules/ai/ai.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/ai", aiRouter);

  // Central error handler (one place for all failures)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}