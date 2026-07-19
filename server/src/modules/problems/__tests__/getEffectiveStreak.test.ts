import { test, expect, describe } from "@jest/globals";
import { getEffectiveStreak } from "../problems.service.js";

// -- getEffectiveStreak --
// This function determines whether a user's streak is still alive.
// A streak should reset if the user hasn't solved a problem since yesterday.
// It drives the leaderboard streak ranking and dashboard streak display.
describe("getEffectiveStreak", () => {
  // Helper: build a Date N days ago at midnight
  const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
  };

  // Helper: build a Date N days ago but with time in the middle of the day
  const daysAgoMidDay = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  // --- Null last solved date: no activity ever ---
  test("should return 0 when lastSolvedDate is null", () => {
    expect(getEffectiveStreak(5, null)).toBe(0);
  });

  // --- Solved today: streak is alive ---
  test("should return currentStreak when solved today (midnight)", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(getEffectiveStreak(7, today)).toBe(7);
  });

  test("should return currentStreak when solved today (midday)", () => {
    const today = daysAgoMidDay(0);
    expect(getEffectiveStreak(3, today)).toBe(3);
  });

  // --- Solved yesterday: streak is still alive (diffDays <= 1) ---
  test("should return currentStreak when solved yesterday", () => {
    const yesterday = daysAgo(1);
    expect(getEffectiveStreak(10, yesterday)).toBe(10);
  });

  // --- Solved 2 days ago: streak is broken ---
  test("should return 0 when solved 2 days ago (streak broken)", () => {
    const twoDaysAgo = daysAgo(2);
    expect(getEffectiveStreak(5, twoDaysAgo)).toBe(0);
  });

  test("should return 0 when solved 7 days ago", () => {
    const oneWeekAgo = daysAgo(7);
    expect(getEffectiveStreak(15, oneWeekAgo)).toBe(0);
  });

  // --- Edge case: streak of 1 ---
  test("should return 1 when streak is 1 and solved today", () => {
    const today = new Date();
    expect(getEffectiveStreak(1, today)).toBe(1);
  });

  // --- Edge case: streak of 0 ---
  test("should return 0 when currentStreak is 0 even if solved today", () => {
    const today = new Date();
    expect(getEffectiveStreak(0, today)).toBe(0);
  });
});
