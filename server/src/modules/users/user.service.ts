import { Skill } from "../../models/Skill.js";
import { User } from "../../models/User.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { determineSkillStatus } from "../../utils/skillConstants.js";

const computeLiquidityScore = (skills: { currentScore: number }[]): number => {
  if (skills.length === 0) return 0;
  const total = skills.reduce((acc, s) => acc + (s.currentScore || 0), 0);
  return Math.round(total / skills.length);
};

export const refreshLiquidityScore = async (
  userId: string,
): Promise<number> => {
  const skills = await Skill.find({ userId }).select("currentScore");
  const newScore = computeLiquidityScore(skills);

  const result = await User.findByIdAndUpdate(
    userId,
    {
      $set: { "liquidityScore.current": newScore },
      $push: {
        "liquidityScore.history": { score: newScore, date: new Date() },
      },
    },
    { new: true },
  );

  if (!result) {
    throw new AppError("User not found while updating liquidity score", 404);
  }

  return newScore;
};

export const getDashboardData = async (userId: string) => {
  // Refresh and persist score
  const currentScore = await refreshLiquidityScore(userId);

  const user = await User.findById(userId).select("liquidityScore");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Skill debts
  const skills = await Skill.find({ userId });

  let debtCount = 0;
  let drainingSkills = 0;

  skills.forEach((skill) => {
    const status = determineSkillStatus(skill.currentScore);
    if (status === "debt") debtCount++;
    if (status === "draining") drainingSkills++;
  });

  // Top skills
  const topSkills = [...skills]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 5)
    .map((s) => ({ name: s.name, score: Math.round(s.currentScore) }));

  return {
    score: currentScore,
    scoreHistory: user.liquidityScore.history,
    activeSkills: skills.length,
    skillDebts: {
      total: debtCount + drainingSkills,
      critical: debtCount,
      drainingSkills,
    },
    topSkills,
  };
};

export const fetchAllUsers = async (
  search: string | undefined,
  page: number,
  limit: number,
) => {
  const query: any = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

export const modifyUserStatus = async (userId: string, status: string) => {
  if (!["active", "blocked"].includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
