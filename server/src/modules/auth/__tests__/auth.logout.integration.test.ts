import dotenv from "dotenv";
dotenv.config();
import { jest, test, expect, describe } from "@jest/globals";
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
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock Email config
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

// Dynamic import of app
const { default: app } = await import("../../../app.js");

describe("POST /api/auth/logout", () => {
  test("should clear cookie and return 200", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Logged out",
    });

    // Verify cookie deletion
    // Express sets "token=;" with Max-Age=0 or Expires in past to clear the cookie
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    
    // Find the 'token' cookie header
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});
