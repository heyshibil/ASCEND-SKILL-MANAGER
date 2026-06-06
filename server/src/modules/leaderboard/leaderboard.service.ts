import type { PipelineStage } from "mongoose";
import { UserProblemStats } from "../../models/UserProblemStats.js";
import { User } from "../../models/User.js";
import { getEffectiveStreak } from "../problems/problems.service.js";
import { withCache } from "../../utils/cache.js";

const fetchLeaderboardFromDB = async (
  userId: string,
  mode: "solved" | "score" | "streak" = "solved",
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;
  const yesterdayStart = new Date();
  yesterdayStart.setHours(0, 0, 0, 0);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Determine sort field based on mode
  let sortField = "totalSolved";
  if (mode === "score") sortField = "liquidityScore.current";
  if (mode === "streak") sortField = "effectiveStreak";

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
        lastSolvedDate: "$lastSolvedDate",
        liquidityScore: { $ifNull: ["$userDoc.liquidityScore.current", 0] },
      },
    },
    {
      $addFields: {
        effectiveStreak: {
          $cond: [
            { $gte: ["$lastSolvedDate", yesterdayStart] },
            "$currentStreak",
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        currentStreak: "$effectiveStreak",
        value:
          mode === "score"
            ? "$liquidityScore"
            : mode === "streak"
              ? "$effectiveStreak"
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

    const effectiveStreak = getEffectiveStreak(
      myStats?.currentStreak || 0,
      myStats?.lastSolvedDate || null,
    );

    const myValue =
      mode === "solved"
        ? myStats?.totalSolved || 0
        : mode === "streak"
          ? effectiveStreak
          : myUser?.liquidityScore?.current || 0;

    // How many users have higher score than me
    const higherCount =
      mode === "streak"
        ? await UserProblemStats.countDocuments({
            lastSolvedDate: { $gte: yesterdayStart },
            currentStreak: { $gt: myValue },
          })
        : await UserProblemStats.countDocuments({
            [sortField]: { $gt: myValue },
          });

    currentUserContext = {
      rank: higherCount + 1,
      user: {
        _id: userId,
        username: myUser?.username,
        avatarUrl: myUser?.avatarUrl,
        value: myValue,
        currentStreak: effectiveStreak,
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
    {
      $addFields: {
        effectiveStreak: {
          $cond: [
            { $gte: ["$lastSolvedDate", yesterdayStart] },
            "$currentStreak",
            0,
          ],
        },
      },
    },
    { $sort: { effectiveStreak: -1 } },
    { $limit: 3 },
    { $project: { username: "$u.username", streak: "$effectiveStreak" } },
  ]);

  return {
    leaderboard: leaderboardList,
    currentUser: currentUserContext,
    hallOfFame,
    hasMore: leaderboardList.length === limit,
  };
};

export const getGlobalLeaderboard = async (
  userId: string,
  mode: "solved" | "score" | "streak" = "solved",
  page: number = 1,
  limit: number = 10,
) => {
  /** Page 1 includes user-specific rank context (currentUserContext),
   so its cache key must be scoped per user to prevent serving User A's rank to User B.
   Pages 2+ are generic leaderboard rows — shared key is safe.*/
  const cacheKey =
    page === 1
      ? `leaderboard:${mode}:page1:uid:${userId}`
      : `leaderboard:${mode}:page${page}`;

  return withCache(
    cacheKey,
    () => fetchLeaderboardFromDB(userId, mode, page, limit),
    { ttl: 600, stale: 120 },
  );
};
