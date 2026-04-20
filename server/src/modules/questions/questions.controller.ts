import type { Request, Response, NextFunction } from "express";
import { generateQuestionId } from "./questions.service.js";
import { Question } from "../../models/Question.js";
import { bulkQuestionsSchema } from "./questions.validation.js";

export const seedBulkQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedQuestions = bulkQuestionsSchema.parse(req.body.questions);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as { index: number; error: string }[],
    };

    for (let i = 0; i < validatedQuestions.length; i++) {
      const payload: any = validatedQuestions[i];

      try {
        payload.questionId = await generateQuestionId(
          payload.type,
          payload.skill,
          payload.level,
        );

        const newQuestion = new Question(payload);
        await newQuestion.save();

        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i + 1,
          error: error.message || "Failed to save to database",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${results.successful} items. Failed ${results.failed}.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

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
    next(error);
  }
};
