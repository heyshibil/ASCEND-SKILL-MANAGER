import { test, expect, describe } from "@jest/globals";
import { registerSchema, loginSchema } from "../auth.validation.js";

// -- registerSchema --
describe("registerSchema", () => {
  const validInput = {
    email: "john@example.com",
    password: "SecurePass1!",
    username: "john_doe",
  };

  test("should accept a valid registration input", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  // careerGoal is optional and has a default
  test("should default careerGoal to 'Fullstack Developer' when not provided", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.careerGoal).toBe("Fullstack Developer");
    }
  });

  test("should accept a custom careerGoal", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      careerGoal: "Backend Engineer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.careerGoal).toBe("Backend Engineer");
    }
  });

  // --- Email validation ---
  test("should reject an invalid email format", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("should reject missing email", () => {
    const { email: _e, ...withoutEmail } = validInput;
    const result = registerSchema.safeParse(withoutEmail);
    expect(result.success).toBe(false);
  });

  // --- Password validation ---
  test("should reject password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "Short1",
    });
    expect(result.success).toBe(false);
  });

  test("should accept password exactly 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "Exact8!x",
    });
    expect(result.success).toBe(true);
  });

  // --- Username validation ---
  test("should reject username shorter than 3 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  test("should reject username longer than 30 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  // Username must only contain letters, numbers, dots, underscores, hyphens
  test("should reject username with spaces", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "john doe",
    });
    expect(result.success).toBe(false);
  });

  test("should reject username with special characters (@, #, !)", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "john@doe!",
    });
    expect(result.success).toBe(false);
  });

  test("should accept username with dots, underscores, and hyphens", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "john.doe_99-dev",
    });
    expect(result.success).toBe(true);
  });

  test("should trim whitespace from username before validation", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: "  johndoe  ",
    });
    // The schema applies trim() before validation
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("johndoe");
    }
  });
});

// -- loginSchema --
describe("loginSchema", () => {
  const validLogin = {
    email: "john@example.com",
    password: "anyPassword",
  };

  test("should accept valid login credentials", () => {
    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  // Login schema only checks email format, not password strength
  test("should accept short password on login (no min length check)", () => {
    const result = loginSchema.safeParse({
      ...validLogin,
      password: "123",
    });
    expect(result.success).toBe(true);
  });

  test("should reject invalid email on login", () => {
    const result = loginSchema.safeParse({
      ...validLogin,
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });

  test("should reject missing email", () => {
    const result = loginSchema.safeParse({ password: "anyPassword" });
    expect(result.success).toBe(false);
  });

  test("should reject missing password", () => {
    const result = loginSchema.safeParse({ email: "john@example.com" });
    expect(result.success).toBe(false);
  });
});
