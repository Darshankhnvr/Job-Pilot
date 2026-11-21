import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";

import { healthRouter } from "./modules/health/health.routes";
import { aiRouter } from "./modules/ai/ai.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { jobsRouter } from "./modules/jobs/jobs.routes";
import { chatRouter } from "./modules/chatbot/chat.routes";
import { searchRouter } from "./modules/search/search.routes";

export function createApp() {
  const app = express();

  // --- Security ---
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      credentials: true,
    })
  );

  // --- Logging ---
  app.use(morgan("combined"));

  // --- Body Parsing ---
  app.use(express.json({ limit: "2mb" }));

  // --- Global Rate Limiting ---
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    })
  );

  // --- Chat endpoint gets tighter rate limiting ---
  const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: "Too many chat requests, please slow down." },
  });

  // --- Routes ---
  app.use("/api/health", healthRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/chat", chatLimiter, chatRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/search", searchRouter);

  // --- 404 ---
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });

  // --- Central error handler ---
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  });

  return app;
}