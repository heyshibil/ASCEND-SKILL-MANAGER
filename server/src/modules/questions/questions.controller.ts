import type { Request, Response, NextFunction } from "express";
import { generateQuestionId } from "./questions.service.js";
import { Question } from "../../models/Question.js";

export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;
    payload.questionId = await generateQuestionId(
      payload.type,
      payload.skill,
      payload.level,
    );

    const newQuestion = new Question(payload);
    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question seeded successfully",
      question: newQuestion,
    });
  } catch (error) {
    next(error)
  }
};
  