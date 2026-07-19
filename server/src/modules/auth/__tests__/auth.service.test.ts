import dotenv from "dotenv";
dotenv.config();
import { jest, test, expect, describe, afterEach } from "@jest/globals";

// --- All mocks MUST be declared before any dynamic imports ---

// Mock argon2 — prevents real hashing in unit tests
jest.unstable_mockModule("argon2", () => ({
  default: {
    hash: jest.fn(),
    verify: jest.fn(),
  },
}));

// Mock User model — prevents real MongoDB connection
jest.unstable_mockModule("../../../models/User.js", () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock sendEmail — prevents real SMTP calls in registration
jest.unstable_mockModule("../../../config/email.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true as never),
}));

// Dynamic imports after mocks
const argon2 = await import("argon2");
const { User } = await import("../../../models/User.js");
const { registerUser, loginUser, getCurrentUser } = await import("../auth.service.js");

// ─── loginUser ────────────────────────────────────────────────────────────────
describe("loginUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // A GitHub OAuth user has no password — should be treated as invalid credentials
  test("should throw 401 when user has no password (OAuth-only account)", async () => {
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "user-id",
          email: "oauth@example.com",
          authProvider: "github",
          password: undefined, // OAuth user has no password
          status: "active",
          isEmailVerified: true,
        }),
    });

    await expect(
      loginUser({ email: "oauth@example.com", password: "any" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  // Blocked users must be rejected at login — security-critical path
  test("should throw 403 when user account is blocked", async () => {
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "user-id",
          email: "blocked@example.com",
          authProvider: "manual",
          password: "hashed-password",
          status: "blocked", // ← blocked account
          isEmailVerified: true,
        }),
    });

    await expect(
      loginUser({ email: "blocked@example.com", password: "Test1234" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // Unverified emails must be blocked from login
  test("should throw 403 when email is not verified", async () => {
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "user-id",
          email: "unverified@example.com",
          authProvider: "manual",
          password: "hashed-password",
          status: "active",
          isEmailVerified: false, // ← unverified
        }),
    });

    await expect(
      loginUser({ email: "unverified@example.com", password: "Test1234" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // Password must be stripped before returning the user — prevents token leaks
  test("should strip password from returned user on success", async () => {
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "user-id",
          email: "user@example.com",
          authProvider: "manual",
          password: "hashed-password",
          status: "active",
          isEmailVerified: true,
        }),
    });

    (argon2.default.verify as jest.Mock).mockResolvedValueOnce(true as never);

    const result = await loginUser({ email: "user@example.com", password: "Test1234" });

    // Password must not appear in the response
    expect(result.user.password).toBeUndefined();
  });

  // Success: must return both user and a JWT token
  test("should return a JWT token on successful login", async () => {
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "user-id",
          email: "user@example.com",
          authProvider: "manual",
          password: "hashed-password",
          status: "active",
          isEmailVerified: true,
        }),
    });

    (argon2.default.verify as jest.Mock).mockResolvedValueOnce(true as never);

    const result = await loginUser({ email: "user@example.com", password: "Test1234" });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.token.split(".").length).toBe(3); // valid JWT structure
  });
});

// ─── registerUser ─────────────────────────────────────────────────────────────
describe("registerUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Duplicate email check — first findOne is a direct await
  test("should throw 409 when email already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "existing-id",
      email: "taken@example.com",
    } as never);

    await expect(
      registerUser({
        email: "taken@example.com",
        password: "Test1234!",
        username: "newuser",
        careerGoal: "Fullstack Developer",
      }),
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("email") });
  });

  // Username uniqueness is checked case-insensitively via regex
  test("should throw 409 when username is already taken", async () => {
    // First call: no duplicate email
    (User.findOne as jest.Mock).mockResolvedValueOnce(null as never);
    // Second call: duplicate username found (returns via .select().lean() chain)
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () => ({ lean: () => Promise.resolve({ _id: "existing-username-id" }) }),
    });

    await expect(
      registerUser({
        email: "new@example.com",
        password: "Test1234!",
        username: "ExistingUser",
        careerGoal: "Fullstack Developer",
      }),
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("username") });
  });

  // Successful registration: must hash password and return a token
  test("should return a token on successful registration", async () => {
    // No duplicate email
    (User.findOne as jest.Mock).mockResolvedValueOnce(null as never);
    // No duplicate username
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () => ({ lean: () => Promise.resolve(null) }),
    });

    (argon2.default.hash as jest.Mock).mockResolvedValueOnce("hashed-pass" as never);

    (User.create as jest.Mock).mockResolvedValueOnce({
      _id: "new-user-id",
      email: "new@example.com",
      username: "brandnew",
    } as never);

    const result = await registerUser({
      email: "new@example.com",
      password: "Test1234!",
      username: "brandnew",
      careerGoal: "Fullstack Developer",
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    // Argon2 hash must have been called with the plain password
    expect(argon2.default.hash).toHaveBeenCalledWith("Test1234!");
  });
});

// ─── getCurrentUser ───────────────────────────────────────────────────────────
describe("getCurrentUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw 404 when user is not found in the database", async () => {
    (User.findById as jest.Mock).mockResolvedValueOnce(null as never);

    await expect(getCurrentUser("ghost-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  // Unverified manual accounts should not access protected resources
  test("should throw 403 for an unverified manual account", async () => {
    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "user-id",
      authProvider: "manual",
      isEmailVerified: false, // ← not verified
    } as never);

    await expect(getCurrentUser("user-id")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test("should return the user for a valid verified account", async () => {
    const mockUser = {
      _id: "user-id",
      authProvider: "manual",
      isEmailVerified: true,
      username: "verifieduser",
    };

    (User.findById as jest.Mock).mockResolvedValueOnce(mockUser as never);

    const result = await getCurrentUser("user-id");
    expect(result).toEqual(mockUser);
  });

  // GitHub OAuth accounts skip email verification entirely
  test("should return the user for a GitHub OAuth account (email check bypassed)", async () => {
    const githubUser = {
      _id: "github-user-id",
      authProvider: "github",
      isEmailVerified: false, // OAuth users may have false here — still valid
    };

    (User.findById as jest.Mock).mockResolvedValueOnce(githubUser as never);

    const result = await getCurrentUser("github-user-id");
    expect(result).toEqual(githubUser);
  });
});
