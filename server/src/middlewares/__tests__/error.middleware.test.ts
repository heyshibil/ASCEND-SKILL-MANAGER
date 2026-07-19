import { test, expect, describe } from "@jest/globals";
import { z } from "zod";
import { AppError, errorHandler } from "../error.middleware.js";
import type { Request, Response, NextFunction } from "express";

const makeMockRes = () => {
  const res = {
    status: function (code: number) {
      this._status = code;
      return this;
    },
    json: function (body: unknown) {
      this._body = body;
      return this;
    },
    _status: 0,
    _body: null as unknown,
  };
  return res;
};

const mockReq = {} as Request;
const mockNext = (() => {}) as NextFunction;

// -- AppError --
describe("AppError", () => {
  test("should carry the correct statusCode and message", () => {
    const err = new AppError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
  });

  test("should be an instance of Error", () => {
    const err = new AppError("Bad request", 400);
    expect(err).toBeInstanceOf(Error);
  });
});

// -- errorHandler middleware --
describe("errorHandler — AppError", () => {
  test("should respond with AppError statusCode and message", () => {
    const err = new AppError("Unauthorized", 401);
    const res = makeMockRes();

    errorHandler(err, mockReq, res as unknown as Response, mockNext);

    expect(res._status).toBe(401);
    expect((res._body as any).success).toBe(false);
    expect((res._body as any).message).toBe("Unauthorized");
  });

  test("should handle 403 Forbidden AppError", () => {
    const err = new AppError("Forbidden: Admin privileges required", 403);
    const res = makeMockRes();

    errorHandler(err, mockReq, res as unknown as Response, mockNext);

    expect(res._status).toBe(403);
    expect((res._body as any).message).toBe("Forbidden: Admin privileges required");
  });

  test("should handle 409 Conflict AppError", () => {
    const err = new AppError("An account with this email already exists", 409);
    const res = makeMockRes();

    errorHandler(err, mockReq, res as unknown as Response, mockNext);

    expect(res._status).toBe(409);
    expect((res._body as any).success).toBe(false);
  });
});

describe("errorHandler — ZodError", () => {
  // ZodError has a complex constructor, so we trigger it via safeParse
  test("should respond with 400 and a field errors array for ZodError", () => {
    // Parse an intentionally bad value to get a real ZodError
    const schema = z.object({ name: z.string() });
    const parsed = schema.safeParse({ name: 123 });

    // This is a ZodError — pull it out and pass to handler
    if (!parsed.success) {
      const res = makeMockRes();

      errorHandler(parsed.error, mockReq, res as unknown as Response, mockNext);

      expect(res._status).toBe(400);
      expect((res._body as any).success).toBe(false);
      expect((res._body as any).message).toBe("Validation failed");
      expect(Array.isArray((res._body as any).errors)).toBe(true);
      expect((res._body as any).errors.length).toBeGreaterThan(0);
      // Each error should have field and message
      const firstError = (res._body as any).errors[0];
      expect(firstError).toHaveProperty("field");
      expect(firstError).toHaveProperty("message");
    }
  });
});

describe("errorHandler — MongoServerError (duplicate key)", () => {
  test("should respond with 409 for Mongo duplicate key error on 'email'", () => {
    // Simulate a Mongo duplicate key error
    const mongoError = new Error("Duplicate key") as any;
    mongoError.name = "MongoServerError";
    mongoError.code = 11000;
    mongoError.keyValue = { email: "test@example.com" };

    const res = makeMockRes();

    errorHandler(mongoError, mockReq, res as unknown as Response, mockNext);

    expect(res._status).toBe(409);
    expect((res._body as any).success).toBe(false);
    expect((res._body as any).message).toContain("email");
  });
});

describe("errorHandler — Unknown error", () => {
  test("should respond with 500 for any unhandled error", () => {
    const err = new Error("Something crashed");
    const res = makeMockRes();

    errorHandler(err, mockReq, res as unknown as Response, mockNext);

    expect(res._status).toBe(500);
    expect((res._body as any).success).toBe(false);
    expect((res._body as any).message).toBe("Internal server error");
  });
});
