import mongoose, { Schema, model, type Document } from "mongoose";
import type { ITrendingSkill } from "../types/index.js";

const trendingSkillSchema = new Schema<ITrendingSkill & Document>(
  {
    skillName: { type: String, required: true, trim: true },
    demandPercentage: { type: Number, required: true, min: 0, max: 100 },
    parentLanguage: { type: String, trim: true },
    openRoles: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const TrendingSkill = mongoose.model("TrendingSkill", trendingSkillSchema);
