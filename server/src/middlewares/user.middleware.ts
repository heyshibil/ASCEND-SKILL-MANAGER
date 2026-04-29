import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { redisConnection } from "../config/redis.js";

const THROTTLE_SECONDS = 60;

export const updateLastSeen = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.userId) {
    try {
      const redisKey = `lastSeen:${req.userId}`;
      const alreadyUpdated = await redisConnection.get(redisKey);

      if (!alreadyUpdated) {
        User.findByIdAndUpdate(req.userId, { lastSeen: new Date() }).exec();
        redisConnection.set(redisKey, "1", "EX", THROTTLE_SECONDS);
      }
    } catch (error) {
      console.error("Failed to update lastSeen:", error);
    }
  }
  next();
};
