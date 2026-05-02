import type { Types } from "mongoose";
import type { DecayTickResult } from "../../types/index.js";
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
 * Process decay for a single user's skills.
 * 1. Apply direct decay to each skill
 * 2. Apply dependency cascade
 * 3. Transition skills to debt if below threshold
 * 4. Refresh liquidity score
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

  // Phase 3: Apply all drops and save
  let decayed = 0;
  let enteredDebt = 0;
  const bulkOps = [];

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

    bulkOps.push({
      updateOne: {
        filter: { _id: skill._id },
        update: {
          $set: { currentScore: newScoreRounded },
        },
      },
    });

    decayed++;
  }

  if (bulkOps.length > 0) {
    await Skill.bulkWrite(bulkOps);
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

  return result
};
