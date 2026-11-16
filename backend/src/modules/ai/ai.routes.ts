import { Router } from "express";
import { llm } from "../../ai/llm";

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