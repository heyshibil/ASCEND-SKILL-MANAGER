import { Schema, model, type Document } from "mongoose";
import type { ISkill } from "../types/index.js";

const skillSchema = new Schema<ISkill & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Foundational", "Framework", "Tooling", "Language"],
      required: true,
    },
    baselineScore: { type: Number, default: 100 },
    currentScore: { type: Number, default: 100 },
    lastVerifiedDate: { type: Date, default: Date.now },
    verificationMethod: {
      type: String,
      enum: ["github", "manual", "linkedin"],
      default: "manual",
    },
    stabilityConstant: { type: Number, required: true },
    masteryMultiplier: { type: Number, default: 1.0 },
    dependsOn: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true },
);

export const Skill = model<ISkill & Document>("Skill", skillSchema);
