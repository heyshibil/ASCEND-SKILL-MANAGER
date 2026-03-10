import { Schema, model, type Document } from "mongoose";
import type { IUser } from "../types/index.js";

const userSchema = new Schema<IUser & Document>(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    targetRole: { type: String, required: true },
    liquidityScore: {
      current: { type: Number, default: 0 },
      history: [
        {
          score: { type: Number },
          date: { type: Date, default: Date.now },
        },
      ],
    },
    settings: {
      decayNotifications: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const User = model<IUser & Document>("User", userSchema);
