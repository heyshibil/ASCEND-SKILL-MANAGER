import { Schema, model, type Document } from "mongoose";
import type { ITestHistory } from "../types/index.js";

const testHistorySchema = new Schema<ITestHistory & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillName: { type: String, required: true },
    questionIds: [{ type: String, required: true }],
  },
  { timestamps: true },
);

export const TestHistory = model<ITestHistory & Document>(
  "TestHistory",
  testHistorySchema,
);
