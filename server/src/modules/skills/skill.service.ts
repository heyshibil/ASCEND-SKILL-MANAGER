import { Skill } from "../../models/Skill.js";
import { User } from "../../models/User.js";
import { getSkillDefaults } from "../../utils/SkillMap.js";
import { AppError } from "../../middlewares/error.middleware.js";

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
