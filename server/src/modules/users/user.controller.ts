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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const data = await userService.fetchAllUsers(
      search as string | undefined,
      Number(page),
      Number(limit),
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await userService.modifyUserStatus(userId as string, status);

    res.status(200).json({ success: true, user });
  } catch (error) {}
};
