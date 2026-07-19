import { test, expect, describe } from "@jest/globals";
import {
  bulkQuestionsSchema,
  updateQuestionSchema,
  visibilitySchema,
  verifiedSchema,
} from "../questions.validation.js";

// -- MCQ Questions --
describe("bulkQuestionsSchema — MCQ", () => {
  const validMcq = {
    type: "mcq" as const,
    skill: "javascript",
    level: "beginner" as const,
    topic: "Closures",
    question: "What is a closure?",
    options: ["A function", "A variable", "A loop", "An object"],
    correctAnswerIndex: 0,
  };

  test("should accept a valid MCQ question", () => {
    const result = bulkQuestionsSchema.safeParse([validMcq]);
    expect(result.success).toBe(true);
  });

  // MCQ must have exactly 4 options — this enforces quiz integrity
  test("should reject MCQ with fewer than 4 options", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validMcq, options: ["A", "B", "C"] },
    ]);
    expect(result.success).toBe(false);
  });

  test("should reject MCQ with more than 4 options", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validMcq, options: ["A", "B", "C", "D", "E"] },
    ]);
    expect(result.success).toBe(false);
  });

  // correctAnswerIndex must point to a valid option (0–3)
  test("should reject MCQ when correctAnswerIndex is negative", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validMcq, correctAnswerIndex: -1 },
    ]);
    expect(result.success).toBe(false);
  });

  test("should reject MCQ when correctAnswerIndex is 4 or more", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validMcq, correctAnswerIndex: 4 },
    ]);
    expect(result.success).toBe(false);
  });

  test("should accept correctAnswerIndex at boundary values (0 and 3)", () => {
    const atZero = bulkQuestionsSchema.safeParse([
      { ...validMcq, correctAnswerIndex: 0 },
    ]);
    const atThree = bulkQuestionsSchema.safeParse([
      { ...validMcq, correctAnswerIndex: 3 },
    ]);
    expect(atZero.success).toBe(true);
    expect(atThree.success).toBe(true);
  });

  // Level must be one of the three valid values
  test("should reject MCQ with invalid level", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validMcq, level: "expert" },
    ]);
    expect(result.success).toBe(false);
  });

  // Required fields
  test("should reject MCQ missing the question text", () => {
    const { question: _q, ...withoutQuestion } = validMcq;
    const result = bulkQuestionsSchema.safeParse([withoutQuestion]);
    expect(result.success).toBe(false);
  });

  test("should reject MCQ missing the skill field", () => {
    const { skill: _s, ...withoutSkill } = validMcq;
    const result = bulkQuestionsSchema.safeParse([withoutSkill]);
    expect(result.success).toBe(false);
  });
});

// -- Code Questions --
describe("bulkQuestionsSchema — Code", () => {
  const validCode = {
    type: "code" as const,
    skill: "javascript",
    level: "intermediate" as const,
    topic: "Array Methods",
    question: "Write a function that sums an array.",
    starterCode: "function sum(arr) {}",
    validationScript: "",
    testCases: [
      { input: "sum([1,2,3])", output: "6" },
    ],
  };

  test("should accept a valid code question", () => {
    const result = bulkQuestionsSchema.safeParse([validCode]);
    expect(result.success).toBe(true);
  });

  // Code questions require at least 1 test case — no test cases = broken grading
  test("should reject code question with zero test cases", () => {
    const result = bulkQuestionsSchema.safeParse([
      { ...validCode, testCases: [] },
    ]);
    expect(result.success).toBe(false);
  });

  test("should accept code question with multiple test cases", () => {
    const result = bulkQuestionsSchema.safeParse([
      {
        ...validCode,
        testCases: [
          { input: "sum([1,2,3])", output: "6" },
          { input: "sum([0,0])", output: "0" },
        ],
      },
    ]);
    expect(result.success).toBe(true);
  });

  test("should reject code question missing starterCode", () => {
    const { starterCode: _s, ...withoutStarter } = validCode;
    const result = bulkQuestionsSchema.safeParse([withoutStarter]);
    expect(result.success).toBe(false);
  });
});

// -- updateQuestionSchema — discriminated union by type --
describe("updateQuestionSchema", () => {
  test("should accept partial MCQ update (only topic)", () => {
    const result = updateQuestionSchema.safeParse({
      type: "mcq",
      topic: "New Topic",
    });
    expect(result.success).toBe(true);
  });

  test("should accept partial code update (only question text)", () => {
    const result = updateQuestionSchema.safeParse({
      type: "code",
      question: "Updated question text",
    });
    expect(result.success).toBe(true);
  });

  test("should reject MCQ update with options count not equal to 4", () => {
    const result = updateQuestionSchema.safeParse({
      type: "mcq",
      options: ["A", "B"], // only 2
    });
    expect(result.success).toBe(false);
  });

  test("should reject code update with empty test cases array", () => {
    const result = updateQuestionSchema.safeParse({
      type: "code",
      testCases: [], // must have at least 1
    });
    expect(result.success).toBe(false);
  });

  test("should reject update without a type discriminator", () => {
    const result = updateQuestionSchema.safeParse({
      topic: "Some topic",
    });
    expect(result.success).toBe(false);
  });
});

// -- visibilitySchema --
describe("visibilitySchema", () => {
  test("should accept isHidden: true", () => {
    const result = visibilitySchema.safeParse({ isHidden: true });
    expect(result.success).toBe(true);
  });

  test("should accept isHidden: false", () => {
    const result = visibilitySchema.safeParse({ isHidden: false });
    expect(result.success).toBe(true);
  });

  test("should reject isHidden as a string", () => {
    const result = visibilitySchema.safeParse({ isHidden: "true" });
    expect(result.success).toBe(false);
  });

  test("should reject missing isHidden field", () => {
    const result = visibilitySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// -- verifiedSchema --
describe("verifiedSchema", () => {
  test("should accept isVerified: true", () => {
    const result = verifiedSchema.safeParse({ isVerified: true });
    expect(result.success).toBe(true);
  });

  test("should accept isVerified: false", () => {
    const result = verifiedSchema.safeParse({ isVerified: false });
    expect(result.success).toBe(true);
  });

  test("should reject isVerified as a number", () => {
    const result = verifiedSchema.safeParse({ isVerified: 1 });
    expect(result.success).toBe(false);
  });
});
