import { Schema, model, type Document } from "mongoose";
import type { ISubmission } from "../types/index.js";

const submissionSchema = new Schema<ISubmission & Document>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: String, required: true },
    code: { type: String, required: true },
    runtime: { type: String, required: true },
    status: {
      type: String,
      enum: ["accepted", "wrong_answer", "runtime_error", "time_limit"],
      required: true,
    },
    passedCases: { type: Number, required: true },
    totalCases: { type: Number, required: true },
    executionTimeMs: { type: Number },
  },
  { timestamps: true },
);

// Creating Index - Fast lookups: "has this user solved this problem?"
submissionSchema.index({ userId: 1, questionId: 1 });

// Leaderboard queries: "all accepted submissions by user"
submissionSchema.index({ userId: 1, status: 1 });

// Recent submissions feed
submissionSchema.index({ createdAt: -1 });

export const Submission = model<ISubmission & Document>(
  "Submission",
  submissionSchema,
);
