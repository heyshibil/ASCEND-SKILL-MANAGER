import dotenv from "dotenv";
dotenv.config();
import { Redis, type RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL;
const isTestEnv =
  process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // BullMQ requires this to be null
  enableReadyCheck: false,
  // In test environment without explicit REDIS_URL, prevent endless background retries
  ...(isTestEnv && !redisUrl
    ? {
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Do not endlessly retry in tests if Redis is offline
      }
    : {
        retryStrategy: (times) => Math.min(times * 100, 3000),
      }),
};

export const redisConnection = new Redis(
  redisUrl || "redis://localhost:6379",
  redisOptions,
);

if (!isTestEnv) {
  redisConnection.on("error", (err) =>
    console.log("❌ Redis connection error:", err),
  );
  redisConnection.on("ready", () => console.log("✅ Redis ready"));
}
