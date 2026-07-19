import { test, expect, describe } from "@jest/globals";
import { determineSkillStatus, SKILL_THRESHOLDS, BOOST_HIKES } from "../skillConstants.js";

// -- determineSkillStatus --
// This function drives the entire dashboard debt/draining/healthy classification.
// Wrong thresholds = wrong status for all users across the platform.
describe("determineSkillStatus", () => {
  // --- Healthy zone (score >= 70) ---
  test("should return 'healthy' for score exactly at threshold (70)", () => {
    expect(determineSkillStatus(70)).toBe("healthy");
  });

  test("should return 'healthy' for score above threshold (85)", () => {
    expect(determineSkillStatus(85)).toBe("healthy");
  });

  test("should return 'healthy' for perfect score (100)", () => {
    expect(determineSkillStatus(100)).toBe("healthy");
  });

  // --- Draining zone (score 31–69) ---
  test("should return 'draining' for score just below healthy (69)", () => {
    expect(determineSkillStatus(69)).toBe("draining");
  });

  test("should return 'draining' for mid-range score (50)", () => {
    expect(determineSkillStatus(50)).toBe("draining");
  });

  test("should return 'draining' for score exactly at draining min (31)", () => {
    expect(determineSkillStatus(31)).toBe("draining");
  });

  // --- Debt zone (score <= 30) ---
  test("should return 'debt' for score just below draining (30)", () => {
    expect(determineSkillStatus(30)).toBe("debt");
  });

  test("should return 'debt' for low score (10)", () => {
    expect(determineSkillStatus(10)).toBe("debt");
  });

  test("should return 'debt' for score at zero", () => {
    expect(determineSkillStatus(0)).toBe("debt");
  });
});

// -- SKILL_THRESHOLDS --
// Document constants with assertions so any accidental change is caught
describe("SKILL_THRESHOLDS constants", () => {
  test("HEALTHY_MIN should be 70", () => {
    expect(SKILL_THRESHOLDS.HEALTHY_MIN).toBe(70);
  });

  test("DRAINING_MIN should be 31", () => {
    expect(SKILL_THRESHOLDS.DRAINING_MIN).toBe(31);
  });

  test("DEBT_MAX should be 30", () => {
    expect(SKILL_THRESHOLDS.DEBT_MAX).toBe(30);
  });

  // Thresholds must be logically consistent
  test("HEALTHY_MIN should be greater than DEBT_MAX", () => {
    expect(SKILL_THRESHOLDS.HEALTHY_MIN).toBeGreaterThan(SKILL_THRESHOLDS.DEBT_MAX);
  });

  test("DRAINING_MIN should be DEBT_MAX + 1 (no gaps or overlaps)", () => {
    expect(SKILL_THRESHOLDS.DRAINING_MIN).toBe(SKILL_THRESHOLDS.DEBT_MAX + 1);
  });
});

// -- BOOST_HIKES --
// Boost values control score progression after each practice session
describe("BOOST_HIKES constants", () => {
  test("MCQ boost hike should be 5", () => {
    expect(BOOST_HIKES.MCQ).toBe(5);
  });

  test("CODE_BEGINNER hike should be 10", () => {
    expect(BOOST_HIKES.CODE_BEGINNER).toBe(10);
  });

  test("CODE_INTERMEDIATE hike should be 25", () => {
    expect(BOOST_HIKES.CODE_INTERMEDIATE).toBe(25);
  });

  test("CODE_ADVANCED hike should be 50", () => {
    expect(BOOST_HIKES.CODE_ADVANCED).toBe(50);
  });

  // Higher difficulty must give higher reward
  test("CODE_ADVANCED hike should be greater than CODE_INTERMEDIATE", () => {
    expect(BOOST_HIKES.CODE_ADVANCED).toBeGreaterThan(BOOST_HIKES.CODE_INTERMEDIATE);
  });

  test("CODE_INTERMEDIATE hike should be greater than CODE_BEGINNER", () => {
    expect(BOOST_HIKES.CODE_INTERMEDIATE).toBeGreaterThan(BOOST_HIKES.CODE_BEGINNER);
  });

  test("CODE_BEGINNER hike should be greater than MCQ hike", () => {
    expect(BOOST_HIKES.CODE_BEGINNER).toBeGreaterThan(BOOST_HIKES.MCQ);
  });
});
