import type { PipelineStage } from "mongoose";
import { UserProblemStats } from "../../models/UserProblemStats.js";
import { User } from "../../models/User.js";

export const getGlobalLeaderboard = async (
  userId: string,
  mode: "solved" | "score" | "streak" = "solved",
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  // Determine sort field based on mode
  let sortField = "totalSolved";
  if (mode === "score") sortField = "liquidityScore.current";
  if (mode === "streak") sortField = "currentStreak";

  // Aggregation pipeline
  const pipeline: PipelineStage[] = [
    // Join UserProblemStats with User collection
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDoc",
      },
    },
    {
      $unwind: "$userDoc",
    },
    {
      $project: {
        _id: "$userDoc._id",
        username: "$userDoc.username",
        avatarUrl: "$userDoc.avatarUrl",
        totalSolved: { $ifNull: ["$totalSolved", 0] },
        currentStreak: { $ifNull: ["$currentStreak", 0] },
        liquidityScore: { $ifNull: ["$userDoc.liquidityScore.current", 0] },
      },
    },
    {
      $addFields: {
        value:
          mode === "score"
            ? "$liquidityScore"
            : mode === "streak"
              ? "$currentStreak"
              : "$totalSolved",
      },
    },
    {
      $sort: { value: -1, currentStreak: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const leaderboardList = await UserProblemStats.aggregate(pipeline);

  // If page 1, fetch current user's absolute rank
  let currentUserContext = null;
  if (page === 1) {
    const myStats = await UserProblemStats.findOne({ userId }).lean();
    const myUser = await User.findById(userId).lean();

    const myValue =
      mode === "solved"
        ? myStats?.totalSolved || 0
        : mode === "streak"
          ? myStats?.currentStreak || 0
          : myUser?.liquidityScore?.current || 0;

    // How many users have higher score than me
    const higherCount = await UserProblemStats.countDocuments({
      [sortField]: { $gt: myValue },
    });

    currentUserContext = {
      rank: higherCount + 1,
      user: {
        _id: userId,
        username: myUser?.username,
        avatarUrl: myUser?.avatarUrl,
        value: myValue,
        currentStreak: myStats?.currentStreak || 0,
      },
    };
  }

  // Hall of fame (Top 3 highest streaks)
  const hallOfFame = await UserProblemStats.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "u",
      },
    },
    { $unwind: "$u" },
    { $sort: { currentStreak: -1 } },
    { $limit: 3 },
    { $project: { username: "$u.username", streak: "$currentStreak" } },
  ]);

  return {
    leaderboard: leaderboardList,
    currentUser: currentUserContext,
    hallOfFame,
    hasMore: leaderboardList.length === limit,
  };
};
