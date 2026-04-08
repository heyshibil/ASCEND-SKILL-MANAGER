import type { Request, Response, NextFunction } from "express";
import * as userService from "./user.service.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new Error("userId is missing in req");

    const data = await userService.getDashboardData(userId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
