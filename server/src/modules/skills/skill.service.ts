import { Skill } from "../../models/Skill.js";
import { User } from "../../models/User.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  BOOST_HIKES,
  determineSkillStatus,
} from "../../utils/skillConstants.js";
import { refreshLiquidityScore } from "../users/user.service.js";
import { getSkillDefaults } from "../../utils/skillMap.js";

interface SkillInput {
  name: string;
  confidence: number;
}

export const initUserSkills = async (
  userId: string,
  selectedSkills: SkillInput[],
) => {
  if (!selectedSkills || selectedSkills.length === 0) {
    throw new AppError("No skills provided", 400);
  }

  // Wipe existing skills just in case the user clicked 'back' to re-do the form
  await Skill.deleteMany({ userId });

  // Map frontend data to schema
  const skillsToInsert = selectedSkills.map((skill) => {
    const defaults = getSkillDefaults(skill.name);
    return {
      userId,
      name: skill.name,
      category: defaults.category,
      baselineScore: skill.confidence,
      currentScore: skill.confidence,
      verificationMethod: "manual",
      stabilityConstant: defaults.stabilityConstant,
      masteryMultiplier: 1.0,
    };
  });

  // Bulk insert
  const insertedSkills = await Skill.insertMany(skillsToInsert);

  // update status of user
  await User.findByIdAndUpdate(userId, { onboardingStatus: "pending_test" });

  return insertedSkills;
};

export const getCategorizedUserSkills = async (userId: string) => {
  const skills = await Skill.find({ userId });

  const categorized = {
    healthy: [] as any,
    draining: [] as any,
    debts: [] as any,
  };

  skills.forEach((skill) => {
    const status = determineSkillStatus(skill.currentScore);

    categorized[
      status === "healthy"
        ? "healthy"
        : status === "draining"
          ? "draining"
          : "debts"
    ].push(skill);
  });

  return categorized;
};

export const applySkillBoost = async (
  userId: string,
  skillName: string,
  boostType: "mcq" | "beginner" | "intermediate" | "advanced",
) => {
  const skill = await Skill.findOne({ userId, name: skillName });

  if (!skill) throw new AppError("Skill not found", 404);

  let hike = 0;

  if (boostType === "mcq") {
    hike = BOOST_HIKES.MCQ;
  } else if (boostType === "beginner") {
    hike = BOOST_HIKES.CODE_BEGINNER;
  } else if (boostType === "intermediate") {
    hike = BOOST_HIKES.CODE_INTERMEDIATE;
  } else if (boostType === "advanced") {
    hike = BOOST_HIKES.CODE_ADVANCED;
  }

  skill.currentScore = Math.min(100, skill.currentScore + hike);
  await skill.save();

  // refresh dashboard liquidity
  await refreshLiquidityScore(userId);

  return { success: true, newScore: skill.currentScore };
};
