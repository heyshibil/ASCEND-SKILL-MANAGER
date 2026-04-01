import type { Request, Response, NextFunction } from "express";
import * as verificationService from "./verification.service.js";

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
