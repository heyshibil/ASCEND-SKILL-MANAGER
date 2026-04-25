import type { Request, Response, NextFunction } from "express";
import * as verificationService from "./verification.service.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const startVerificationTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const { skillName, level } = req.body;

    const testData = await verificationService.generateTest(
      userId,
      skillName,
      level || "Intermediate",
    );

    res.status(200).json({
      success: true,
      ...testData, // Returns { mcqs: [], codeTest: {} }
    });
  } catch (error) {
    next(error);
  }
};

export const submitVerificationTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId!;
    const { skillName, mcqAnswers, codeAnswer, codeQuestionId } = req.body;

    const result = await verificationService.gradeVerificationTest(
      userId,
      skillName,
      mcqAnswers,
      codeAnswer,
      codeQuestionId,
    );

    res.status(200).json({
      success: true,
      ...result,
    }); //  { finalScore, feedback, breakdown }
  } catch (error) {
    next(error);
  }
};

export const generateBoost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { skillName, type, level } = req.query;

    if (!skillName || !type) {
      throw new AppError("Skill Name and Type required", 400);
    }

    const result = await verificationService.generateBoostTest(
      req.userId!,
      skillName as string,
      type as "mcq" | "compiler",
      level as string | undefined,
    );

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const submitMcqBoost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { skillName, answers } = req.body;

    const result = await verificationService.gradeMcqBoost(
      req.userId!,
      skillName,
      answers,
    );

    res
      .status(200)
      .json({ success: true, message: "MCQ Boost Graded", result });
  } catch (error) {
    next(error);
  }
};

export const submitCompilerBoost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillName, codeAnswer, questionId } = req.body;

    const result = await verificationService.gradeCompilerBoost(req.userId!, skillName, codeAnswer, questionId);

    res.status(200).json({ success: true, message: "Compiler Boost Graded", result });
  } catch (error) {
    next(error)
  }
}
