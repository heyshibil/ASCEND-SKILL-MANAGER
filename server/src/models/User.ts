import { Schema, model, type Document } from "mongoose";
import type { IUser } from "../types/index.js";

const userSchema = new Schema<IUser & Document>(
  {
    // Auth
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    authProvider: {
      type: String,
      enum: ["github", "manual"],
      required: true,
    },
    githubId: { type: String, unique: true, sparse: true, default: undefined },
    password: { type: String, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    pendingEmail: { type: String, trim: true, lowercase: true },
    emailChangeToken: { type: String },
    emailChangeExpires: { type: Date },
    pendingPassword: { type: String, select: false },
    passwordChangeToken: { type: String },
    passwordChangeExpires: { type: Date },

    // Profile
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    avatarUrl: { type: String },
    careerGoal: { type: String, default: "Fullstack Developer" },
    coreLanguage: { type: String },
    onboardingStatus: {
      type: String,
      enum: ["pending_scan", "pending_discovery", "pending_test", "completed"],
      default: "pending_discovery",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // Scores
    liquidityScore: {
      current: { type: Number, default: 0 },
      history: [
        {
          score: { type: Number },
          date: { type: Date, default: Date.now },
        },
      ],
    },

    // Preference
    settings: {
      decayNotifications: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const User = model<IUser & Document>("User", userSchema);
