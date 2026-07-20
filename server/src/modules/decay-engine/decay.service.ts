import type { Types } from "mongoose";
import type { DecayTickResult, NotificationType } from "../../types/index.js";
import { User } from "../../models/User.js";
import {
  DECAY_BATCH_SIZE,
  DECAY_FLOOR,
  DEPENDENCY_IMPACT_RATIO,
  MIN_DROP_THRESHOLD,
} from "./decay.constants.js";
import { Skill } from "../../models/Skill.js";
import { SkillDefinition } from "../../models/SkillDefinition.js";
import {
  calculateDecayDelta,
  calculateDependencyDrop,
} from "../../utils/decayCalculator.js";
import { determineSkillStatus } from "../../utils/skillConstants.js";
import { refreshLiquidityScore } from "../users/user.service.js";
import { createOrUpdateNotification } from "../notifications/notification.service.js";

/**
 * Build a lookup map of SkillDefinition _id → document
 * Cached per tick (called once per processUserDecay, could be elevated)
 */

// Cache variables
let _cachedDefMap: Map<
  string,
  { normalizedName: string; stabilityConstant: number }
> | null = null;

let _cachedDefMapTimestamp = 0;
const DEF_MAP_TTL_MS = 15 * 60 * 1000; // 15 min cache

const getSkillDefinitionMap = async () => {
  const now = Date.now();
  if (_cachedDefMap && now - _cachedDefMapTimestamp < DEF_MAP_TTL_MS) {
    return _cachedDefMap;
  }

  const defs = await SkillDefinition.find({ isActive: true })
    .select("normalizedName stabilityConstant")
    .lean();

  _cachedDefMap = new Map(
    defs.map((d) => [
      d._id!.toString(),
      {
        normalizedName: d.normalizedName,
        stabilityConstant: d.stabilityConstant,
      },
    ]),
  );

  _cachedDefMapTimestamp = now;
  return _cachedDefMap;
};

/**
 * Maps a skill status string to the Notification type enum value.
 */
const mapStatusToType = (status: string): NotificationType => {
  if (status === "debt") return "DEBT";
  if (status === "draining") return "DECAYING";
  return "REVERIFY"; // healthy — skill recovered
};

/**
 * Builds a human-readable notification message for a skill status change.
 */
const buildMessage = (skillName: string, newStatus: string): string => {
  if (newStatus === "debt") {
    return `\u26A0\uFE0F ${skillName} has entered skill debt. Verify it now to stop the decay.`;
  }
  if (newStatus === "draining") {
    return `\uD83D\uDCC9 ${skillName} is draining. Consider a quick verification to recover your score.`;
  }
  // healthy — skill recovered
  return `\u2705 ${skillName} has recovered to a healthy score. Keep it up!`;
};

/**
 * Process decay for a single user's skills.
 * 1. Apply direct decay to each skill
 * 2. Apply dependency cascade
 * 3. Transition skills to debt if below threshold
 * 4. Fire notifications on status transitions (never on every tick)
 * 5. Refresh liquidity score
 */
const processUserDecay = async (
  userId: string,
  deltaHours: number,
): Promise<{ decayed: number; enteredDebt: number }> => {
  const skills = await Skill.find({ userId });

  if (skills.length === 0) return { decayed: 0, enteredDebt: 0 };

  const skillDefMap = await getSkillDefinitionMap();

  // phase 1: Calculate direct decay drops
  const directDrops = new Map<string, number>();

  for (const skill of skills) {
    const drop = calculateDecayDelta(
      skill.currentScore,
      deltaHours,
      skill.stabilityConstant,
      skill.masteryMultiplier,
    );

    directDrops.set(skill._id!.toString(), drop);
  }

  // phase 2: Calculate dependency cascade drops
  const cascadeDrops = new Map<string, number>();

  for (const skill of skills) {
    if (!skill.dependsOn || skill.dependsOn.length === 0) continue;

    // Find parent skills that THIS skill depends on
    for (const parentDefId of skill.dependsOn) {
      const parentDef = skillDefMap.get(parentDefId.toString());
      if (!parentDef) continue;

      // Find the user's instance of the parent skill
      const parentSkill = skills.find(
        (s) => s.name.toLowerCase() === parentDef.normalizedName,
      );
      if (!parentSkill) continue;

      const parentDrop = directDrops.get(parentSkill._id!.toString()) || 0;
      if (parentDrop <= 0) continue;

      const cascadeDrop = calculateDependencyDrop(
        parentDrop,
        parentSkill.stabilityConstant,
        skill.stabilityConstant,
        DEPENDENCY_IMPACT_RATIO,
      );

      const existing = cascadeDrops.get(skill._id!.toString()) || 0;
      cascadeDrops.set(skill._id!.toString(), existing + cascadeDrop);
    }
  }

  // Phase 3: Apply all drops, fire notifications on status transitions, then save
  let decayed = 0;
  let enteredDebt = 0;
  const bulkOps = [];

  // Collect notification promises to fire concurrently after bulkWrite
  const notificationPromises: Promise<void>[] = [];

  for (const skill of skills) {
    const skillId = skill._id!.toString();
    const directDrop = directDrops.get(skillId) || 0;
    const cascadeDrop = cascadeDrops.get(skillId) || 0;
    const totalDrop = directDrop + cascadeDrop;

    if (totalDrop < MIN_DROP_THRESHOLD) continue;

    const previousStatus = determineSkillStatus(skill.currentScore);

    const newScore = Math.max(DECAY_FLOOR, skill.currentScore - totalDrop);
    const newScoreRounded = Math.round(newScore * 10) / 10;

    const newStatus = determineSkillStatus(newScoreRounded);

    if (newStatus === "debt" && previousStatus !== "debt") enteredDebt++;

    // Determine if a notification should fire:
    // - Only when status actually changed
    // - Notify on any move into debt or draining
    // - Also notify when recovering back to healthy from a previously notified non-healthy state
    const lastNotified = skill.lastNotifiedStatus ?? null;
    const statusChanged = newStatus !== previousStatus;
    const shouldNotify =
      statusChanged &&
      (newStatus !== "healthy" ||
        (newStatus === "healthy" &&
          lastNotified !== null &&
          lastNotified !== "healthy"));

    const $setFields: Record<string, unknown> = {
      currentScore: newScoreRounded,
    };

    if (shouldNotify) {
      $setFields.lastNotifiedStatus = newStatus;

      notificationPromises.push(
        createOrUpdateNotification(
          userId,
          skillId,
          mapStatusToType(newStatus),
          buildMessage(skill.name, newStatus),
        ).catch((err) => {
          // Log but never crash the decay tick for a notification failure
          console.error(
            `[DECAY] ⚠️ Failed to upsert notification for skill ${skill.name}:`,
            err,
          );
        }),
      );
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: skill._id },
        update: { $set: $setFields },
      },
    });

    decayed++;
  }

  if (bulkOps.length > 0) {
    await Skill.bulkWrite(bulkOps);
    // Fire notifications concurrently after the bulk save succeeds
    await Promise.allSettled(notificationPromises);
    await refreshLiquidityScore(userId);
  }

  return { decayed, enteredDebt };
};

/**
 * Main entry point — called by the BullMQ worker on each cron tick.
 * Processes ALL active users in batches.
 */
export const runDecayTick = async (
  deltaHours: number,
): Promise<DecayTickResult> => {
  const result: DecayTickResult = {
    usersProcessed: 0,
    skillsDecayed: 0,
    skillsEnteredDebt: 0,
    errors: 0,
  };

  let lastId: Types.ObjectId | null = null;

  // pagination method to avoid loading all users at once
  while (true) {
    const query: Record<string, unknown> = {
      onboardingStatus: "completed",
      status: "active",
    };

    // if lastId - create query from there (batches)
    if (lastId) {
      query._id = { $gt: lastId };
    }

    const users = await User.find(query)
      .select("_id")
      .sort({ _id: 1 })
      .limit(DECAY_BATCH_SIZE)
      .lean();

    if (users.length === 0) break;

    for (const user of users) {
      try {
        const userResult = await processUserDecay(
          user._id!.toString(),
          deltaHours,
        );

        result.skillsDecayed += userResult.decayed;
        result.skillsEnteredDebt += userResult.enteredDebt;
        result.usersProcessed++;
      } catch (error) {
        console.error(`[DECAY] ❌ Failed for user ${user._id}:`, error);
        result.errors++;
      }
    }

    lastId = users[users.length - 1]?._id!;
  }

  return result;
};
