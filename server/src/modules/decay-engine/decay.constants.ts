// How often the decay cron fires (every 6 hours)
export const DECAY_CRON_EXPRESSION = "0 */6 * * *";

// How many users to process per batch 
export const DECAY_BATCH_SIZE = 50;

// Minimum score
export const DECAY_FLOOR = 0;

// Dependency cascade
export const DEPENDENCY_IMPACT_RATIO = 0.35;

// Minimum drop threshold 
export const MIN_DROP_THRESHOLD = 0.1;

// BullMQ Queue name
export const DECAY_QUEUE_NAME = "SKILL_DECAY";

// Repeatable job ID 
export const DECAY_JOB_ID = "decay-engine-tick";
