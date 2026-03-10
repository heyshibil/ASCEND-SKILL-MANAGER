import type { Types } from "mongoose";

export interface IUserSettings {
  decayNotification: boolean;
  weeklyReport: boolean;
}

export interface ILiquidityHistory {
  score: number;
  date: Date;
}

export interface IUser {
  _id?: Types.ObjectId;
  githubId: string;
  username: string;
  email: string;
  targetRole: string;
  liquidityScore: {
    current: number;
    history: ILiquidityHistory[];
  };
  settings: IUserSettings;
  lastProcessedAt?: Date;
}

export interface ISkill {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  category: "Foundational" | "Framework" | "Tooling" | "Language";
  baselineScore: number; // Po
  currentScore: number; // live charge
  lastVerifiedDate: Date; // t starts here
  verificationMethod: "github" | "manual" | "linkedin";
  stabilityConstant: number; // Stability Constant
  masteryMultiplier: number; // Bonus for experiance
  dependsOn?: Types.ObjectId[]; // Dependency graph
}
