import { AppError } from "../../middlewares/error.middleware.js";
import { TrendingSkill } from "../../models/TrendingSkill.js";
import type { ITrendingSkill } from "../../types/index.js";

export const getActiveMarketSkills = async () => {
  const trendingSkills = await TrendingSkill.find().sort({
    demandPercentage: -1,
  });

  return trendingSkills;
};

export const createTrendingSkill = async (data: ITrendingSkill) => {
  return await TrendingSkill.create(data);
};

export const updateTrendingSkill = async (
  id: string,
  updateData: Partial<ITrendingSkill>,
) => {
  const skill = await TrendingSkill.findById(id);

  if (!skill) {
    throw new AppError("Trending skill not found", 404);
  }

  let metricsChanged = false;

  if (updateData.skillName !== undefined)
    skill.skillName = updateData.skillName;

  if (updateData.parentLanguage !== undefined)
    skill.parentLanguage = updateData.parentLanguage;

  if (
    updateData.demandPercentage !== undefined &&
    updateData.demandPercentage !== skill.demandPercentage
  ) {
    skill.demandPercentage = updateData.demandPercentage;
    metricsChanged = true;
  }

  if (
    updateData.openRoles !== undefined &&
    updateData.openRoles !== skill.openRoles
  ) {
    skill.openRoles = updateData.openRoles;
    metricsChanged = true;
  }

  if (metricsChanged) {
    skill.history.push({
      date: new Date(),
      demandPercentage: skill.demandPercentage,
      openRoles: skill.openRoles,
    });
  }

  return await skill.save();
};

export const deleteTrendingSkill = async (id: string) => {
  return await TrendingSkill.findByIdAndDelete(id);
};
