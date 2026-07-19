import { jest, test, expect, describe, afterEach } from "@jest/globals";

// ──────────────────────────────────────────────────────────────────────────────
// refreshLiquidityScore is the core scoring function.
// It reads all user skills, averages their currentScore, and persists to user doc.
//
// We focus on the logic, not the database — everything external is mocked.
// ──────────────────────────────────────────────────────────────────────────────

// Mock Redis — pulled in transitively via cache.ts
jest.unstable_mockModule("../../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: jest.fn().mockResolvedValue(null as never),
    set: jest.fn().mockResolvedValue("OK" as never),
    del: jest.fn().mockResolvedValue(1 as never),
  },
}));

// Mock Skill model — controls what skills the function sees
const mockSkillFind = jest.fn();
jest.unstable_mockModule("../../../models/Skill.js", () => ({
  Skill: {
    find: mockSkillFind,
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// Mock User model — controls what user doc is returned and .save() behavior
const mockUserFindById = jest.fn();
jest.unstable_mockModule("../../../models/User.js", () => ({
  User: {
    findById: mockUserFindById,
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

// Mock cache utility — used by getDashboardData, not directly by refreshLiquidityScore
jest.unstable_mockModule("../../../utils/cache.js", () => ({
  withCache: jest.fn(),
  invalidateCache: jest.fn().mockResolvedValue(undefined as never),
}));

// Mock UserProblemStats and SkillDefinition — pulled in at module level
jest.unstable_mockModule("../../../models/UserProblemStats.js", () => ({
  UserProblemStats: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));
jest.unstable_mockModule("../../../models/SkillDefinition.js", () => ({
  SkillDefinition: { find: jest.fn(), findOne: jest.fn(), countDocuments: jest.fn() },
}));

// Mock problems.service — pulled in by user.service (uses getEffectiveStreak)
jest.unstable_mockModule("../../problems/problems.service.js", () => ({
  getEffectiveStreak: jest.fn().mockReturnValue(5),
}));

// Mock questions.repository — pulled in by user.service (countQuestionsByType)
jest.unstable_mockModule("../../questions/questions.repository.js", () => ({
  countQuestionsByType: jest.fn().mockResolvedValue(0 as never),
}));

// Mock email — used by requestEmailChange/requestPasswordChange
jest.unstable_mockModule("../../../config/email.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true as never),
}));

// Mock argon2 — used by requestPasswordChange
jest.unstable_mockModule("argon2", () => ({
  default: { hash: jest.fn(), verify: jest.fn() },
}));

// Dynamic import after all mocks
const { refreshLiquidityScore } = await import("../user.service.js");

// ─── refreshLiquidityScore ────────────────────────────────────────────────────
describe("refreshLiquidityScore", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper: build a mock user document with liquidityScore fields
  const makeMockUser = (currentScore: number, history: any[] = []) => ({
    liquidityScore: { current: currentScore, history },
    markModified: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined as never),
  });

  // --- Empty skills: no skills = score of 0 ---
  test("should return 0 when user has no skills", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([]),
    });
    mockUserFindById.mockResolvedValueOnce(
      makeMockUser(0) as never,
    );

    const score = await refreshLiquidityScore("user-id");

    expect(score).toBe(0);
  });

  // --- Single skill: score equals that skill's currentScore ---
  test("should return the skill's score when there is only one skill", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 80 }]),
    });
    mockUserFindById.mockResolvedValueOnce(
      makeMockUser(80) as never,
    );

    const score = await refreshLiquidityScore("user-id");

    expect(score).toBe(80);
  });

  // --- Multiple skills: liquidity = average of all currentScores ---
  test("should return the correct average across multiple skills", async () => {
    // (60 + 80 + 100) / 3 = 80
    mockSkillFind.mockReturnValueOnce({
      select: () =>
        Promise.resolve([
          { currentScore: 60 },
          { currentScore: 80 },
          { currentScore: 100 },
        ]),
    });
    mockUserFindById.mockResolvedValueOnce(makeMockUser(0) as never);

    const score = await refreshLiquidityScore("user-id");

    expect(score).toBe(80);
  });

  // --- Rounding: Math.round is applied ---
  test("should round the average score correctly", async () => {
    // (70 + 71) / 2 = 70.5 → rounds to 71
    mockSkillFind.mockReturnValueOnce({
      select: () =>
        Promise.resolve([{ currentScore: 70 }, { currentScore: 71 }]),
    });
    mockUserFindById.mockResolvedValueOnce(makeMockUser(0) as never);

    const score = await refreshLiquidityScore("user-id");

    expect(score).toBe(71);
  });

  // --- Persistence: user.save() is called when the score changes ---
  test("should call user.save() when the liquidity score changes", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 85 }]),
    });

    const mockUser = makeMockUser(40); // stored score 40, new score will be 85
    mockUserFindById.mockResolvedValueOnce(mockUser as never);

    await refreshLiquidityScore("user-id");

    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  // --- No unnecessary writes: skip save() when score is unchanged ---
  test("should NOT call user.save() when the score has not changed", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 70 }]),
    });

    // user.liquidityScore.current already matches the computed score (70)
    // AND history already has an entry with score 70 → no change
    const mockUser = makeMockUser(70, [{ score: 70, date: new Date() }]);
    mockUserFindById.mockResolvedValueOnce(mockUser as never);

    await refreshLiquidityScore("user-id");

    expect(mockUser.save).not.toHaveBeenCalled();
  });

  // --- History tracking: new entry is pushed for a new day ---
  test("should push a new history entry when score changes on a new day", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 90 }]),
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // History has an entry from yesterday with a different score
    const mockUser = makeMockUser(50, [{ score: 50, date: yesterday }]);
    mockUserFindById.mockResolvedValueOnce(mockUser as never);

    await refreshLiquidityScore("user-id");

    // A new history entry should have been pushed
    expect(mockUser.liquidityScore.history.length).toBe(2);
    expect(mockUser.liquidityScore.history[1].score).toBe(90);
  });

  // --- History capping: limits history to 100 entries ---
  test("should cap the history array at 100 entries", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 90 }]),
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Create 100 existing entries
    const existingHistory = Array.from({ length: 100 }, () => ({
      score: 50,
      date: yesterday,
    }));

    const mockUser = makeMockUser(50, existingHistory);
    mockUserFindById.mockResolvedValueOnce(mockUser as never);

    await refreshLiquidityScore("user-id");

    // The length should still be 100 (oldest shifted out)
    expect(mockUser.liquidityScore.history.length).toBe(100);
    // The newest entry should be at the end
    expect(mockUser.liquidityScore.history[99].score).toBe(90);
  });

  // --- 404: throws when user does not exist ---
  test("should throw 404 when user is not found", async () => {
    mockSkillFind.mockReturnValueOnce({
      select: () => Promise.resolve([{ currentScore: 80 }]),
    });
    mockUserFindById.mockResolvedValueOnce(null as never);

    await expect(refreshLiquidityScore("ghost-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
