import { Queue } from "bullmq";
import { DECAY_QUEUE_NAME } from "../modules/decay-engine/decay.constants.js";
import { redisConnection } from "../config/redis.js";

export const decayQueue = new Queue(DECAY_QUEUE_NAME, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: { count: 24 }, // keep last 24 successful jobs
    removeOnFail: { count: 48 }, // keep last 48 successful jobs, debugging
  },
});
