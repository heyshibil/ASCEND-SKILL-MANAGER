import { test, expect, describe } from "@jest/globals";
import {
  calculateCurrentScore,
  calculateDecayDelta,
  calculateDependencyDrop,
} from "../decayCalculator.js";

describe("decayCalculator", () => {
  // Decay test - Now
  test("should return baseline score when no time has passed", () => {
    const result = calculateCurrentScore(100, new Date(), 30);
    expect(result).toBe(100);
  });

  // Decay test - Very long time ago
  test("should return exactly 0 when score decays below 1", () => {
    const tenYearsAgo = new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000);
    const stabilityConstant = 30;

    const result = calculateCurrentScore(100, tenYearsAgo, stabilityConstant);

    expect(result).toBe(0);
  });

  // Mastery multiplier test
  test("higher masteryMultiplier should decay slower than default", () => {
    const sixyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const stabilityConstant = 30;

    const lowMultiplierResult = calculateCurrentScore(
      100,
      sixyDaysAgo,
      stabilityConstant,
      1.0,
    );

    const highMultiplierResult = calculateCurrentScore(
      100,
      sixyDaysAgo,
      stabilityConstant,
      3.0,
    );

    expect(highMultiplierResult).toBeGreaterThan(lowMultiplierResult);
  });
});

describe("calculateDecayDelta", () => {
  test("should return zero when currentScore is less than or equal to zero ", () => {
    const currentScore = -10;
    const deltaHours = 6;
    const stabilityConstant = 30;
    const masteryMultiplier = 1;

    const result = calculateDecayDelta(
      currentScore,
      deltaHours,
      stabilityConstant,
      masteryMultiplier,
    );

    expect(result).toBe(0);
  });

  test("should return zero when deltaHours is less than or equal to zero ", () => {
    const currentScore = 100;
    const deltaHours = 0;
    const stabilityConstant = 30;
    const masteryMultiplier = 1;

    const result = calculateDecayDelta(
      currentScore,
      deltaHours,
      stabilityConstant,
      masteryMultiplier,
    );

    expect(result).toBe(0);
  });

  test("should return a value less than currentScore and greater than zero resembles drop", () => {
    const currentScore = 100;
    const deltaHours = 48; // 2days
    const stabilityConstant = 30;
    const masteryMultiplier = 1;

    const result = calculateDecayDelta(
      currentScore,
      deltaHours,
      stabilityConstant,
      masteryMultiplier,
    );

    console.log("DROP SCORE:", result);

    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(currentScore);
  });

  test("should return a value less than lowMultplier for highMultiplier", () => {
    const currentScore = 100;
    const deltaHours = 48; // 2days
    const stabilityConstant = 30;
    const lowMultiplier = 1;
    const highMultiplier = 3;

    const lowMultiplierResult = calculateDecayDelta(
      currentScore,
      deltaHours,
      stabilityConstant,
      lowMultiplier,
    );

    const highMultiplierResult = calculateDecayDelta(
      currentScore,
      deltaHours,
      stabilityConstant,
      highMultiplier,
    );

    console.log("DROP SCORE OF LOW MULTIPLIER:", lowMultiplierResult);
    console.log("DROP SCORE OF HIGH MULTIPLIER:", highMultiplierResult);

    expect(highMultiplierResult).toBeLessThan(lowMultiplierResult);
  });
});

describe("calculateDependencyDrop", () => {
  test("should return zero when parent drop is zero", () => {
    const parentDrop = 0;
    const parentStability = 30;
    const childStability = 40;
    const impactRatio = 0.35;

    const result = calculateDependencyDrop(
      parentDrop,
      parentStability,
      childStability,
      impactRatio,
    );

    expect(result).toBe(0);
  });

  test("should return a value greater than zero resembles dependecy drop", () => {
    const parentDrop = 10;
    const parentStability = 60;
    const childStability = 30;
    const impactRatio = 0.35;

    const result = calculateDependencyDrop(
      parentDrop,
      parentStability,
      childStability,
      impactRatio,
    );

    console.log("CHILD DROP DEPENDED ON PARENT:", result);

    expect(result).toBeGreaterThan(0);
  });

  test("should cap stabilityRatio at 2.0 even when raw ratio is much higher", () => {
    const parentDrop = 10;
    const impactRatio = 0.35;

    // raw ratio = 1000/10 = 100 → should be capped to 2.0
    const resultWithHugeRatio = calculateDependencyDrop(
      parentDrop,
      1000,
      10,
      impactRatio,
    );

    const resultWithRatioExactlyTwo = calculateDependencyDrop(
      parentDrop,
      40,
      20,
      impactRatio,
    );

    expect(resultWithHugeRatio).toBe(resultWithRatioExactlyTwo);
  });
});
