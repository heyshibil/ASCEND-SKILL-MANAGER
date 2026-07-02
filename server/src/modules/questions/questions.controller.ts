import type { Request, Response, NextFunction } from "express";
import { generateQuestionId } from "./questions.service.js";
import {
  bulkQuestionsSchema,
  updateQuestionSchema,
  visibilitySchema,
  verifiedSchema,
} from "./questions.validation.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { resolveRuntime } from "../../utils/runtimeResolver.js";
import { runCodeTest } from "../verification/compiler.service.js";
import {
  deleteQuestionByQuestionId,
  findByQuestionId,
  insertQuestion,
  listQuestionsAdmin,
  updateQuestion as updateQuestionRepo,
} from "./questions.repository.js";

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
        const questionId = await generateQuestionId(
          payload.type,
          payload.skill,
          payload.level,
        );

        await insertQuestion({ ...payload, questionId });

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
    const questionId = await generateQuestionId(
      payload.type,
      payload.skill,
      payload.level,
    );

    const newQuestion = await insertQuestion({ ...payload, questionId });

    res.status(201).json({
      success: true,
      message: "Question seeded successfully",
      question: newQuestion,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return next(
        new AppError("ID generation conflict, please try again.", 409),
      );
    }
    next(error);
  }
};

export const getAllQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = 1,
      limit = 20,
      skill,
      level,
      type,
      search,
      showHidden,
      isVerified,
      sort,
    } = req.query;

    const { questions, total } = await listQuestionsAdmin({
      page: Number(page),
      limit: Number(limit),
      showHidden: showHidden === "true",
      ...(skill ? { skill: skill as string } : {}),
      ...(level
        ? { level: level as "beginner" | "intermediate" | "advanced" }
        : {}),
      ...(type ? { type: type as "mcq" | "code" } : {}),
      ...(search ? { search: search as string } : {}),
      ...(isVerified === "true"
        ? { isVerified: true }
        : isVerified === "false"
          ? { isVerified: false }
          : {}),
      ...(sort ? { sort: sort as "old" | "verified" | "unverified" } : {}),
    });

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const question = await findByQuestionId(req.params.questionId as string);
    if (!question) throw new AppError("Question not found", 404);

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await findByQuestionId(req.params.questionId as string);
    if (!existing) throw new AppError("Question not found", 404);

    // Validate with the question's own type injected so discriminated union works
    const validated = updateQuestionSchema.parse({
      type: existing.type,
      ...req.body,
    });

    // Strip `type` — it is immutable (encoded in questionId)
    const { type: _type, ...updateFields } = validated;

    const updated = await updateQuestionRepo(
      req.params.questionId as string,
      updateFields,
    );

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isHidden } = visibilitySchema.parse(req.body);

    const updated = await updateQuestionRepo(req.params.questionId as string, {
      isHidden,
    });
    if (!updated) throw new AppError("Question not found", 404);

    const action = isHidden ? "hidden from users" : "visible to users";

    res.status(200).json({
      success: true,
      message: `Question is now ${action}`,
      data: { isHidden: updated.isHidden },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const question = await deleteQuestionByQuestionId(
      req.params.questionId as string,
    );
    if (!question) throw new AppError("Question not found", 404);

    res.status(200).json({
      success: true,
      message: "Question permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Admin-only: run a code question against its test cases via Lambda
export const adminRunCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const question = await findByQuestionId(req.params.questionId as string);
    if (!question || question.type !== "code") {
      throw new AppError("Code question not found", 404);
    }
    if (!question.testCases || question.testCases.length === 0) {
      throw new AppError("Question has no test cases", 400);
    }

    const { code } = req.body;
    if (!code) throw new AppError("Code is required", 400);

    const testCases = question.testCases.map((tc) => ({
      input: tc.input,
      output: tc.output,
    }));

    const runtime = resolveRuntime(question.skill);
    const result = await runCodeTest(code, testCases, runtime);

    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// Admin-only: toggle isVerified status on a question
export const toggleVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isVerified } = verifiedSchema.parse(req.body);

    const updated = await updateQuestionRepo(req.params.questionId as string, {
      isVerified,
    });
    if (!updated) throw new AppError("Question not found", 404);

    const action = isVerified
      ? "marked as verified"
      : "verification status removed";

    res.status(200).json({
      success: true,
      message: `Question ${action}`,
      data: { isVerified: updated.isVerified },
    });
  } catch (error) {
    next(error);
  }
};
