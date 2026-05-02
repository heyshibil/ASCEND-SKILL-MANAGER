import { Skill } from "../../models/Skill.js";
import { User } from "../../models/User.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  BOOST_HIKES,
  determineSkillStatus,
} from "../../utils/skillConstants.js";
import { refreshLiquidityScore } from "../users/user.service.js";
import { SkillDefinition } from "../../models/SkillDefinition.js";
import {
  ensureDefaultSkillDefinitions,
  normalizeSkillName,
} from "./skill-catalog.service.js";

interface SkillInput {
  name: string;
  confidence: number;
}

const getCatalogSkillsForInput = async (skills: SkillInput[]) => {
  await ensureDefaultSkillDefinitions();

  const normalizedNames = [
    ...new Set(skills.map((skill) => normalizeSkillName(skill.name))),
  ];

  const catalogSkills = await SkillDefinition.find({
    normalizedName: { $in: normalizedNames },
    isActive: true,
  }).lean();

  const catalogByName = new Map(
    catalogSkills.map((skill) => [skill.normalizedName, skill]),
  );

  const missing = normalizedNames.filter((name) => !catalogByName.has(name));
  if (missing.length > 0) {
    throw new AppError(
      "One or more selected skills are not available in the preset catalog.",
      400,
    );
  }

  return catalogByName;
};

export const initUserSkills = async (
  userId: string,
  selectedSkills: SkillInput[],
) => {
  if (!selectedSkills || selectedSkills.length === 0) {
    throw new AppError("No skills provided", 400);
  }

  // Wipe existing skills just in case the user clicked 'back' to re-do the form
  await Skill.deleteMany({ userId });
  const catalogByName = await getCatalogSkillsForInput(selectedSkills);

  // Map frontend data to schema
  const skillsToInsert = selectedSkills.map((skill) => {
    const preset = catalogByName.get(normalizeSkillName(skill.name))!;
    return {
      userId,
      name: preset.name,
      category: preset.category,
      baselineScore: skill.confidence,
      currentScore: skill.confidence,
      verificationMethod: "manual",
      stabilityConstant: preset.stabilityConstant,
      masteryMultiplier: 1.0,
      dependsOn: preset.dependsOn ?? [],
    };
  });

  // Bulk insert
  const insertedSkills = await Skill.insertMany(skillsToInsert);

  // update status of user
  await User.findByIdAndUpdate(userId, { onboardingStatus: "pending_test" });

  return insertedSkills;
};

export const addSkills = async (userId: string, newSkills: SkillInput[]) => {
  if (!newSkills || newSkills.length === 0) {
    throw new AppError("No skills provided", 400);
  }

  // No duplicate skills
  const existingSkills = await Skill.find({ userId });
  const existingSkillNames = new Set(
    existingSkills.map((s) => s.name.toLowerCase()),
  );
  const catalogByName = await getCatalogSkillsForInput(newSkills);

  const skillsToInsert = [];

  for (const skill of newSkills) {
    const preset = catalogByName.get(normalizeSkillName(skill.name))!;

    if (!existingSkillNames.has(preset.name.toLowerCase())) {
      skillsToInsert.push({
        userId,
        name: preset.name,
        category: preset.category,
        baselineScore: skill.confidence,
        currentScore: skill.confidence,
        verificationMethod: "manual",
        stabilityConstant: preset.stabilityConstant,
        masteryMultiplier: 1.0,
        dependsOn: preset.dependsOn ?? [],
      });
    }
  }

  if (skillsToInsert.length === 0) {
    throw new AppError(
      "All provided skills already exist in your profile.",
      400,
    );
  }

  const insertedSkills = await Skill.insertMany(skillsToInsert);

  await refreshLiquidityScore(userId);
  return insertedSkills;
};

export const deleteSkill = async (userId: string, skillId: string) => {
  const deletedSkill = await Skill.findOneAndDelete({ _id: skillId, userId });

  if (!deletedSkill) {
    throw new AppError("Skill not found", 404);
  }

  await refreshLiquidityScore(userId);
  return deletedSkill;
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
  skill.lastVerifiedDate = new Date(); 
  await skill.save();

  // refresh dashboard liquidity
  await refreshLiquidityScore(userId);

  return skill.currentScore;
};
