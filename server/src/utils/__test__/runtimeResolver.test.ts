import { test, expect, describe } from "@jest/globals";
import { resolveRuntime, getFallbackSkill } from "../runtimeResolver.js";

// -- resolveRuntime --
describe("resolveRuntime", () => {
  // Direct skill mappings
  test("should map 'javascript' to 'javascript' runtime", () => {
    expect(resolveRuntime("javascript")).toBe("javascript");
  });

  test("should map 'python' to 'python' runtime", () => {
    expect(resolveRuntime("python")).toBe("python");
  });

  test("should map 'typescript' to 'javascript' runtime", () => {
    expect(resolveRuntime("typescript")).toBe("javascript");
  });

  test("should map 'react' to 'javascript' runtime", () => {
    expect(resolveRuntime("react")).toBe("javascript");
  });

  test("should map 'node.js' to 'javascript' runtime", () => {
    expect(resolveRuntime("node.js")).toBe("javascript");
  });

  test("should map 'django' to 'python' runtime", () => {
    expect(resolveRuntime("django")).toBe("python");
  });

  // Case insensitivity
  test("should be case insensitive — 'JavaScript' maps correctly", () => {
    expect(resolveRuntime("JavaScript")).toBe("javascript");
  });

  test("should be case insensitive — 'Python' maps correctly", () => {
    expect(resolveRuntime("Python")).toBe("python");
  });

  // Unknown skill fallback — wrong runtime = wrong Lambda = broken execution
  test("should default unknown skill to 'javascript' runtime", () => {
    expect(resolveRuntime("rust")).toBe("javascript");
  });

  test("should default empty string to 'javascript' runtime", () => {
    expect(resolveRuntime("")).toBe("javascript");
  });
});

// -- getFallbackSkill --
describe("getFallbackSkill", () => {
  test("should return 'JavaScript' as fallback for 'react'", () => {
    expect(getFallbackSkill("react")).toBe("JavaScript");
  });

  test("should return 'JavaScript' as fallback for 'node.js'", () => {
    expect(getFallbackSkill("node.js")).toBe("JavaScript");
  });

  test("should return 'Python' as fallback for 'django'", () => {
    expect(getFallbackSkill("django")).toBe("Python");
  });

  test("should return 'JavaScript' as fallback for 'typescript'", () => {
    expect(getFallbackSkill("typescript")).toBe("JavaScript");
  });

  // No fallback available — return null (caller must handle)
  test("should return null for 'javascript' (no fallback needed)", () => {
    expect(getFallbackSkill("javascript")).toBeNull();
  });

  test("should return null for unknown skill with no fallback", () => {
    expect(getFallbackSkill("cobol")).toBeNull();
  });

  // Case insensitivity
  test("should be case insensitive — 'React' returns fallback", () => {
    expect(getFallbackSkill("React")).toBe("JavaScript");
  });
});
