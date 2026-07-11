import { jest, test, expect, describe } from "@jest/globals";
import request from "supertest";

// Mock redis
jest.unstable_mockModule("../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock queue
jest.unstable_mockModule("../../queues/scan.queue.js", () => ({
  scanQueue: {
    add: jest.fn(),
    getJob: jest.fn(),
  },
}));

const { default: app } = await import("../../app.js");

describe("GET /health", () => {
  test("should return API health status", async () => {
    const result = await request(app).get("/health");

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("OK");
    expect(result.body.timestamp).toBeDefined();
  });
});
