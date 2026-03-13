import dontenv from "dotenv";
dontenv.config();
import { Redis, type RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL as string;

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, //BullMQ requires this to be null
  enableReadyCheck: false,
};

export const redisConnection = new Redis(redisUrl, redisOptions);

redisConnection.on("error", (err) =>
  console.log("❌ Redis connection error:", err),
);
redisConnection.on("ready", () => console.log("✅ Redis ready"));
