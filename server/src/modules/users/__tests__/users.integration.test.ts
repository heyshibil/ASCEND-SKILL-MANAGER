import dotenv from "dotenv";
dotenv.config();
import { jest, test, expect, describe } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockFindById = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();

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
    findById: mockFindById,
    find: mockFind,
    countDocuments: mockCountDocuments,
  },
}));

const { default: app } = await import("../../../app.js");

// -- RBAC Test --

describe("GET GET /api/users/admin/all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 when there is no token", async () => {
    const res = await request(app).get("/api/users/admin/all");
    expect(res.status).toBe(401);
  });

  test("should return 403 when user is not ADMIN", async () => {
    // authenticate middleware
    mockFindById.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-id",
          status: "active",
        } as never),
      }),
    });

    // isAdmin middleware
    mockFindById.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue({
        _id: "user-id",
        role: "user",
      } as never),
    });

    const token = jwt.sign({ userId: "user-id" }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/users/admin/all")
      .set("Cookie", [`token=${token}`]);

    expect(mockFindById).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(403);
  });

  test("should return 200 when user is ADMIN", async () => {
    // authenticate middleware
    mockFindById.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-id",
          status: "active",
        } as never),
      }),
    });

    // isAdmin middleware
    mockFindById.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue({
        _id: "user-id",
        role: "admin",
      } as never),
    });

    // getAllUsers controller → fetchAllUsers → User.find().sort().limit().skip().lean()
    mockFind.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([] as never), // empty user list is fine
          }),
        }),
      }),
    });

    // getAllUsers controller → fetchAllUsers → User.countDocuments()
    mockCountDocuments.mockResolvedValueOnce(0 as never);

    const token = jwt.sign({ userId: "user-id" }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/users/admin/all")
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
  });
});
