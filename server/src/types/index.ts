import type { Types } from "mongoose";

// Define common fields once
interface IBaseEntity {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserSettings {
  decayNotifications: boolean;
  weeklyReport: boolean;
}

export interface ILiquidityHistory {
  score: number;
  date: Date;
}

// User
export interface IUser extends IBaseEntity {
  role: "user" | "admin";
  authProvider: "github" | "manual";
  githubId?: string | undefined;
  password?: string | undefined; //manual users
  isEmailVerified: boolean;
  emailVerificationToken?: string | undefined;
  emailVerificationExpires?: Date | undefined;

  // Profile
  username: string;
  email: string;
  avatarUrl?: string; //from github
  careerGoal: string;
  onboardingStatus:
    | "pending_scan"
    | "pending_discovery"
    | "pending_test"
    | "completed";

  // Score
  liquidityScore: {
    current: number;
    history: ILiquidityHistory[];
  };

  // Preferences
  settings: IUserSettings;
  lastProcessedAt?: Date;
}

// Skill
export interface ISkill extends IBaseEntity {
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

// Question
export interface ITestCase {
  input: string;
  output: string;
}

export interface IQuestion extends IBaseEntity {
  questionId: string;
  skill: string;
  level: "beginner" | "intermediate" | "advanced";
  topic: string;
  type: "mcq" | "code";
  question?: string;

  // MCQ Fields
  options?: string[];
  correctAnswerIndex?: number;

  // Code Fields
  starterCode?: string;
  validationScript?: string;
  testCases?: ITestCase[];
}

// TestHistory
export interface ITestHistory extends IBaseEntity {
  userId: Types.ObjectId;
  skillName: string;
  questionIds: string[];
}

// Lambda types
export interface TestCase {
  input: string;
  output: string;
}

export interface LambdaResponse {
  statusCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface CompilerResult {
  compilerScore: number;
  passedCases: number;
  totalCases: number;
}

// Hot skills
export interface ITrendingSkill extends IBaseEntity {
  skillName: string;
  demandPercentage: number;
  parentLanguage?: string;
  openRoles: number;
}
