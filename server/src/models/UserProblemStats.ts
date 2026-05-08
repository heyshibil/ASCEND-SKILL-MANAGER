import { Schema, model, type Document } from "mongoose";
import type { IUserProblemStats } from "../types/index.js";

const userProblemStatsSchema = new Schema<IUserProblemStats & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date },
    solvedQuestionIds: [{ type: String }],
  },
  { timestamps: true },
);

export const UserProblemStats = model<IUserProblemStats & Document>(
  "UserProblemStats",
  userProblemStatsSchema,
);
