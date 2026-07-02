import "dotenv/config";
import mongoose from "mongoose";
import { Question } from "../models/Question.js";
import { prisma } from "../config/prisma.js";

const MONGO_URI = process.env.MONGO_URI!;

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  // Get all mongoDB questions
  console.log("Fetching questions from MongoDB...");
  const mongoQuestions = await Question.find({}).lean();
  console.log(`Found ${mongoQuestions.length} questions in MongoDB.`);

  let successCount = 0;
  let failCount = 0;
  const failures: { questionId: string; error: string }[] = [];

  // Loop and insert each question into pg with prisma
  for (const mq of mongoQuestions) {
    try {
      await prisma.question.create({
        data: {
          questionId: mq.questionId,
          skill: mq.skill,
          level: mq.level,
          topic: mq.topic,
          type: mq.type,
          question: mq.question ?? null,
          options: mq.options ?? [],
          correctAnswerIndex: mq.correctAnswerIndex ?? null,
          starterCode: mq.starterCode ?? null,
          validationScript: mq.validationScript ?? null,
          isHidden: Boolean(mq.isHidden),
          isVerified: Boolean(mq.isVerified),
          ...(mq.testCases?.length
            ? {
                testCases: {
                  create: mq.testCases.map((tc, i) => ({
                    sortOrder: i,
                    input: tc.input,
                    expectedOutput: tc.output,
                  })),
                },
              }
            : {}),
        },
      });

      successCount++;
    } catch (err: any) {
      failCount++;
      failures.push({ questionId: mq.questionId, error: err.message });
    }
  }

  // Summary Report
  console.log("\n========== MIGRATION SUMMARY ==========");
  console.log(`Total questions in MongoDB: ${mongoQuestions.length}`);
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  if (failures.length > 0) {
    console.log("\n--- Failed Questions ---");
    failures.forEach((f) => {
      console.log(`  ${f.questionId}: ${f.error}`);
    });
  }

  const pgCount = await prisma.question.count();
  console.log(`\nPostgreSQL question count after migration: ${pgCount}`);

  if (pgCount !== successCount) {
    console.log("⚠️  WARNING: PostgreSQL count doesn't match success count!");
  } else {
    console.log("✅ Row counts match. Migration verified.");
  }

  console.log("=========================================\n");

  // disconnect mongoose
  await mongoose.disconnect();
  console.log("Done. MongoDB disconnected.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
