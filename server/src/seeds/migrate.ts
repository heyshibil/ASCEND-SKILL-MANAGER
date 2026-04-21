// server/src/seeds/migrate.ts
import "dotenv/config"; // 1. CRITICAL: Loads your .env file
import mongoose from "mongoose";
import { Question } from "../models/Question.js";

const SKILL_MAP: Record<string, string> = {
  javascript: "JS",
  typescript: "TS",
  python: "PY",
  "node.js": "NODE",
  react: "REA",
  mongodb: "MDB",
  // expand..
};

const migrateQuestionIds = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is missing from environment file");
  }

  console.log("🔌 Connecting to Database...");
  await mongoose.connect(process.env.MONGO_URI);

  const allQuestions = await Question.find({}).sort({ createdAt: 1 });
  let migratedCount = 0;

  for (const q of allQuestions) {
    // 2. Generate the safe prefix dynamically
    const typePrefix = q.type === "code" ? "CODE" : "MCQ";
    const skillKey = q.skill.toLowerCase();
    const safeSkill = SKILL_MAP[skillKey] ?? q.skill.substring(0, 3).toUpperCase();
    const safeLevel = q.level.substring(0, 3).toUpperCase();
    
    // Example: CODE-JS-BEG
    const prefix = `${typePrefix}-${safeSkill}-${safeLevel}`;

    // If the ID already exactly matches the new format (e.g., CODE-JS-BEG-001), skip it!
    const isAlreadyMigrated = new RegExp(`^${prefix}-\\d{3}$`).test(q.questionId);
    if (isAlreadyMigrated) continue;

    // 4. Safely query the highest number with a strict dash
    const existingPattern = new RegExp(`^${prefix}-\\d+$`);
    const existing = await Question.findOne({
      questionId: existingPattern,
      _id: { $ne: q._id },
    }).sort({ questionId: -1 }); 

    let num = 1;
    if (existing?.questionId) {
      const match = existing.questionId.match(/\d+$/);
      if (match) num = parseInt(match[0], 10) + 1;
    }

    const newId = `${prefix}-${num.toString().padStart(3, "0")}`;

    console.log(`🚀 [${q.type.toUpperCase()}] Renamed: ${q.questionId}  →  ${newId}`);
    
    // We use updateOne so we don't accidentally trigger other Mongoose validation/save hooks
    await Question.updateOne({ _id: q._id }, { $set: { questionId: newId } });
    migratedCount++;
  }

  console.log(`\n✅ Migration successfully complete. Updated ${migratedCount} questions.`);
  await mongoose.disconnect();
};

migrateQuestionIds().catch(console.error);
