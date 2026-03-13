import { Worker, Job } from "bullmq";
import axios from "axios";
import { redisConnection } from "../config/redis.js";
import { Skill } from "../models/Skill.js";
import { calculateCurrentScore } from "../utils/decayCalculator.js";

const scanWorker = new Worker(
  "GITHUB_SCAN",
  async (job: Job) => {
    const { userId, accessToken, username } = job.data;
    console.log(`[WORKER] 🔍 Analyzing repositories for: ${username}`);

    try {
      // Fetch user's public repositories
      const { data: repos } = await axios.get(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      // Initialize Skill Inventory, We map languages to our Skill model and set the baseline
      for (const repo of repos) {
        if (repo.language) {
          const lastCommitDate = new Date(repo.updated_at);

          // calculate initial decay score
          const initialDecayedScore = calculateCurrentScore(
            100,
            lastCommitDate,
            100,
            1.0,
          );

          await Skill.findOneAndUpdate(
            { userId, name: repo.language },
            {
              category: "Language",
              baselineScore: 100,
              currentScore: initialDecayedScore, 
              lastVerifiedDate: lastCommitDate,
              verificationMethod: "github", // Verfied skill carry 20%+ weight
              stabilityConstant: 100,
              masteryMultiplier: 1.0,
            },
            { upsert: true, new: true },
          );
        }
      }

      return { status: "completed", skillsFound: repos.length };
    } catch (error: any) {
      console.error(`[WORKER] ❌ Scan failed for ${username}:`, error.message);
      throw error; // Let BullMQ handle the retry
    }
  },
  { connection: redisConnection as any },
);
