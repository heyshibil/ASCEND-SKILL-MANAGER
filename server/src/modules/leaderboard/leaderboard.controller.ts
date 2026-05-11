import type { Request, Response, NextFunction } from "express";
import { getGlobalLeaderboard } from "./leaderboard.service.js";

export const fetchLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const mode = (req.query.mode as "solved" | "score" | "streak") || "solved";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await getGlobalLeaderboard(userId, mode, page, limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
