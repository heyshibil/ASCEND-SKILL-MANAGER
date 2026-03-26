import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Custom error class for throwing known errors
export class AppError extends Error {
  statusCode:  number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors → 400 with field details
  if (err instanceof ZodError) {
    const fieldErrors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: fieldErrors,
    });
    return;
  }
  // Our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }
  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
    return;
  }
  // Unknown error → 500
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};