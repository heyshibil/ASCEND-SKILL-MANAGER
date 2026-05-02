import { Job, Worker } from "bullmq";
import { DECAY_QUEUE_NAME } from "../modules/decay-engine/decay.constants.js";
import { runDecayTick } from "../modules/decay-engine/decay.service.js";
import { redisConnection } from "../config/redis.js";

const decayWorker = new Worker(
  DECAY_QUEUE_NAME,
  async (job: Job) => {
    const { deltaHours } = job.data;
    console.log(`[DECAY WORKER] ⏳ Starting decay tick (Δ${deltaHours}h)...`);

    const result = await runDecayTick(deltaHours);

    console.log(
      `[DECAY WORKER] ✅ Tick complete — ` +
        `Users: ${result.usersProcessed}, ` +
        `Decayed: ${result.skillsDecayed}, ` +
        `New debts: ${result.skillsEnteredDebt}, ` +
        `Errors: ${result.errors}`,
    );

    return result;
  },
  // concurrency 1 : only one tick at a time
  { connection: redisConnection as any, concurrency: 1 },
);

decayWorker.on("failed", (job, err) => {
  console.error(`[DECAY WORKER] ❌ Job ${job?.id} failed:`, err.message);
});

export default decayWorker;
