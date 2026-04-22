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
  // why this partial??
) => {
  return await TrendingSkill.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteTrendingSkill = async (id: string) => {
  return await TrendingSkill.findByIdAndDelete(id);
};
