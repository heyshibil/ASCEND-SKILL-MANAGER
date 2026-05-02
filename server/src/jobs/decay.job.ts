import {
  DECAY_CRON_EXPRESSION,
  DECAY_JOB_ID,
} from "../modules/decay-engine/decay.constants.js";
import { decayQueue } from "../queues/decay.queue.js";

export const registerDecayJob = async (): Promise<void> => {
  await decayQueue.upsertJobScheduler(
    DECAY_JOB_ID,
    { pattern: DECAY_CRON_EXPRESSION },
    {
      name: "decay-tick",
      data: { deltaHours: 6 },
    },
  );

  console.log(
    `✅ Decay engine scheduled: "${DECAY_CRON_EXPRESSION}" (every 6 hours)`,
  );
};
