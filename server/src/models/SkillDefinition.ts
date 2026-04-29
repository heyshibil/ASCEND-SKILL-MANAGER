import { Schema, model, type Document } from "mongoose";
import type { ISkillDefinition } from "../types/index.js";

const skillDefinitionSchema = new Schema<ISkillDefinition & Document>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Foundational", "Framework", "Tooling", "Language"],
      required: true,
    },
    stabilityConstant: { type: Number, required: true, min: 1 },
    dependsOn: [{ type: Schema.Types.ObjectId, ref: "SkillDefinition" }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const SkillDefinition = model<ISkillDefinition & Document>(
  "SkillDefinition",
  skillDefinitionSchema,
);
