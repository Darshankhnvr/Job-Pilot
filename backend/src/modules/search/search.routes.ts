import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { authenticate, type AuthenticatedRequest } from "../../middleware/authenticate";

export const searchRouter = Router();

/** GET /api/search/history — retrieve user's search history */
searchRouter.get(
  "/history",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;

      const history = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      res.json({ history });
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /api/search/history/:id — delete a single history entry */
searchRouter.delete(
  "/history/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthenticatedRequest;

      await prisma.searchHistory.deleteMany({
        where: { id: req.params.id, userId },
      });

      res.json({ message: "History entry deleted" });
    } catch (err) {
      next(err);
    }
  }
);
