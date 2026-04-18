import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { AppError } from "./error.middleware.js";
import type { IUser } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const isAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const user = await User.findById(req.userId).lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "admin") {
      throw new AppError("Forbidden: Admin privileges required", 403);
    }

    req.user = user as IUser;
    next();
  } catch (error) {
    next(error);
  }
};
