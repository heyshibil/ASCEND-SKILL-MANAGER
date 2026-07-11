// --- NOTE ---
/**
 * We use dynamic importing rather than static imports to use mock modules. 
 * 
 * When we use static imports, it is hoisted and call and cache real dependencies such as real redis, real mongodb instead of using the mock one.
 * 
 * We use unstable_mockModule("module-path in ESM and jest.mock("module-path")
 * 
 * Why it's simpler in CJS:
Jest hoists jest.mock() calls automatically to the top of the file during compilation — even above your require/import statements — regardless of where you physically write it in the file. So you don't need await import() gymnastics; a normal static import works fine.
 */

import dotenv from "dotenv";
dotenv.config();
import { jest, test, expect, describe } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";

// Mock redis
jest.unstable_mockModule("../../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock queue
jest.unstable_mockModule("../../../queues/scan.queue.js", () => ({
  scanQueue: {
    add: jest.fn(),
    getJob: jest.fn(),
  },
}));

// Mock User model
jest.unstable_mockModule("../../../models/User.js", () => ({
  User: {
    findById: jest.fn(() => ({
      select: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue({
          _id: "sample1234xyz",
          status: "active",
        } as never),
      })),
    })),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock Send mail
jest.unstable_mockModule("../../../config/email.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true as never),
}));

// Mock Argon2
jest.unstable_mockModule("argon2", () => ({
  default: {
    hash: jest.fn(),
    verify: jest.fn(),
  },
}));
const argon2 = await import("argon2"); // module object

const { default: app } = await import("../../../app.js");

// Get me
describe("GET /api/auth/me", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("should return 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["token=invalid"]);
    expect(res.status).toBe(401);
  });

  test("should return 200 when token is valid", async () => {
    const token = jwt.sign(
      { userId: "sample1234xyz" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${token}`]);
    expect(res.status).toBe(200);
  });

  test.skip("should return 401 when user no longer exists", async () => {
    // override mock just for no user found test
    const { User } = await import("../../../models/User.js");
    (User.findById as jest.Mock).mockReturnValueOnce({
      select: () => ({ lean: () => Promise.resolve(null) }),
    });

    const token = jwt.sign({ userId: "ghost-id" }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(401);
  });
});

// Register
describe("POST /api/auth/register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 when email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "Test1234!",
      username: "testuser",
    });

    expect(res.status).toBe(400);
  });

  test("should return 400 when password is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "abc@gmail.com",
      password: "123",
      username: "testuser",
    });

    expect(res.status).toBe(400);
  });

  // Here we are not testing our database responds - we use mock database and check our logic responds to duplicate emails
  test("should return 409 when email already exists", async () => {
    const { User } = await import("../../../models/User.js");
    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "existing-id",
      email: "test@test.com",
    } as never);

    const res = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      password: "Test1234!",
      username: "newuser",
    });

    expect(res.status).toBe(409);
  });

  test("should return 201 when registration succeeds", async () => {
    const { User } = await import("../../../models/User.js");

    // no duplicate email
    (User.findOne as jest.Mock).mockResolvedValueOnce(null as never);

    // no duplicate username (chained .select().lean())
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () => ({ lean: () => Promise.resolve(null) }),
    });

    // user creation succeeds
    (User.create as jest.Mock).mockResolvedValueOnce({
      _id: "new-user-id",
      email: "brandnew@test.com",
      username: "brandnewuser",
    } as never);

    const res = await request(app).post("/api/auth/register").send({
      email: "brandnew@test.com",
      password: "Test1234!",
      username: "brandnewuser",
    });

    expect(res.status).toBe(201);
  });
});

// Login
describe("POST /api/auth/login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "invalid-email", password: "test1234" });

    expect(res.status).toBe(400);
  });

  test("should return 401 when user not found", async () => {
    const { User } = await import("../../../models/User.js");

    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () => Promise.resolve(null),
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@gmail.com", password: "Test1234" });

    expect(res.status).toBe(401);
  });

  // Returns 401 for every password - coz argon2 mock has setup into false
  test("should return 401 for wrong password", async () => {
    const { User } = await import("../../../models/User.js");

    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "new-user-id",
          email: "newuser@gmail.com",
          username: "newuser",
          password: "hashed-password-string",
          authProvider: "manual",
          status: "active",
          isEmailVerified: true,
        }),
    });

    (argon2.default.verify as jest.Mock).mockResolvedValueOnce(false as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "newuser@gmail.com", password: "Test1234" });

    expect(res.status).toBe(401);
  });

  test("should return 200 when login succeed", async () => {
    const { User } = await import("../../../models/User.js");

    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "new-user-id",
          email: "newuser@gmail.com",
          username: "newuser",
          password: "hashed-password-string",
          authProvider: "manual",
          status: "active",
          isEmailVerified: true,
        }),
    });

    (argon2.default.verify as jest.Mock).mockResolvedValueOnce(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "newuser@gmail.com", password: "Test1234" });

    expect(res.status).toBe(200);
  });
});

// -- Valid Auth Flow --
describe("Valid auth flow", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should login and access /api/auth/me using returned cookie", async () => {
    const { User } = await import("../../../models/User.js");

    // Login finds the user
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "new-user-id",
          email: "newuser@gmail.com",
          username: "newuser",
          password: "hashed-password-string",
          authProvider: "manual",
          status: "active",
          isEmailVerified: true,
        }),
    });

    // Password is correct
    (argon2.default.verify as jest.Mock).mockResolvedValueOnce(true as never);

    const agent = request.agent(app);

    // 1: Login
    const loginResult = await agent.post("/api/auth/login").send({
      email: "newuser@gmail.com",
      password: "Test1234",
    });

    expect(loginResult.status).toBe(200);
    expect(loginResult.headers["set-cookie"]).toBeDefined();

    // 2: Agent auto sends login cookie
    const getMeResult = await agent.get("/api/auth/me");

    expect(getMeResult.status).toBe(200);
  });
});
