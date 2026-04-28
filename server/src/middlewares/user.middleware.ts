import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";

export const updateLastSeen = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.userId) {
    try {
      await User.findByIdAndUpdate(req.userId, { lastSeen: new Date() });
    } catch (error) {
      console.error("Failed to update lastSeen:", error);
    }
  }
  next();
};
