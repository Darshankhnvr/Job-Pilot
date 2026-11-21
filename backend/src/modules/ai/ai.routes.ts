import { Router } from "express";
import { llm } from "../../ai/llm";
import { extractJobCriteria } from "../../ai/extractJobCriteria";

export const aiRouter = Router();

aiRouter.post("/test", async (req, res, next) => {
  try {
    const message =
      (req.body?.message as string) ||
      "Say hello to JobPilot in one short sentence.";

    const response = await llm.invoke(message);

    res.json({
      reply: String(response.content),
    });
  } catch (err) {
    next(err);
  }
});

aiRouter.post("/parse", async (req, res, next) => {
  try {
    const message = req.body?.message;
    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "message is required" });
    }

    const criteria = await extractJobCriteria(message); // already validated + defaulted
    res.json({ criteria });
  } catch (err) {
    next(err);
  }
});