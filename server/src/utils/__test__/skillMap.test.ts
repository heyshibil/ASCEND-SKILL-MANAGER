import { test, expect, describe } from "@jest/globals";
import { getSkillDefaults } from "../skillMap.js";

// -- getSkillDefaults --
// stabilityConstant feeds directly into decay math.
// Wrong constant = incorrect decay speed for every user who has that skill.
describe("getSkillDefaults", () => {
  // --- Known skills — exact values ---
  test("should return correct defaults for 'javascript'", () => {
    const result = getSkillDefaults("javascript");
    expect(result.category).toBe("Language");
    expect(result.stabilityConstant).toBe(90);
  });

  test("should return correct defaults for 'python'", () => {
    const result = getSkillDefaults("python");
    expect(result.category).toBe("Language");
    expect(result.stabilityConstant).toBe(90);
  });

  test("should return correct defaults for 'react'", () => {
    const result = getSkillDefaults("react");
    expect(result.category).toBe("Framework");
    expect(result.stabilityConstant).toBe(60);
  });

  test("should return correct defaults for 'typescript'", () => {
    const result = getSkillDefaults("typescript");
    expect(result.category).toBe("Language");
    expect(result.stabilityConstant).toBe(85);
  });

  test("should return correct defaults for 'node.js'", () => {
    const result = getSkillDefaults("node.js");
    expect(result.category).toBe("Framework");
    expect(result.stabilityConstant).toBe(85);
  });

  test("should return correct defaults for 'html'", () => {
    const result = getSkillDefaults("html");
    expect(result.category).toBe("Foundational");
    expect(result.stabilityConstant).toBe(120);
  });

  test("should return correct defaults for 'css'", () => {
    const result = getSkillDefaults("css");
    expect(result.category).toBe("Foundational");
    expect(result.stabilityConstant).toBe(100);
  });

  test("should return correct defaults for 'mongodb'", () => {
    const result = getSkillDefaults("mongodb");
    expect(result.category).toBe("Tooling");
    expect(result.stabilityConstant).toBe(75);
  });

  // --- Case insensitivity ---
  // Skill names come from multiple sources (user input, GitHub scan, seed data)
  // All must normalize correctly
  test("should be case insensitive — 'JavaScript' matches 'javascript'", () => {
    const lower = getSkillDefaults("javascript");
    const mixed = getSkillDefaults("JavaScript");
    expect(mixed.category).toBe(lower.category);
    expect(mixed.stabilityConstant).toBe(lower.stabilityConstant);
  });

  test("should be case insensitive — 'React' matches 'react'", () => {
    const lower = getSkillDefaults("react");
    const mixed = getSkillDefaults("React");
    expect(mixed.stabilityConstant).toBe(lower.stabilityConstant);
  });

  // --- Unknown skill fallback ---
  // Any skill not in the dictionary must get a safe default, not crash
  test("should return fallback defaults for unknown skill", () => {
    const result = getSkillDefaults("cobol");
    expect(result.category).toBe("Tooling");
    expect(result.stabilityConstant).toBe(70);
  });

  test("should return fallback defaults for empty string", () => {
    const result = getSkillDefaults("");
    expect(result.category).toBe("Tooling");
    expect(result.stabilityConstant).toBe(70);
  });

  // --- Foundational skills must have higher stability than frameworks ---
  // html/css are foundations — they should decay slower than framework skills
  test("html stabilityConstant should be higher than react stabilityConstant", () => {
    const html = getSkillDefaults("html");
    const react = getSkillDefaults("react");
    expect(html.stabilityConstant).toBeGreaterThan(react.stabilityConstant);
  });
});
