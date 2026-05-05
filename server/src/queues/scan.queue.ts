import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const scanQueue = new Queue("GITHUB_SCAN", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 1000, age: 3600 }, // Keep recent jobs so frontend can poll status
  },
});
