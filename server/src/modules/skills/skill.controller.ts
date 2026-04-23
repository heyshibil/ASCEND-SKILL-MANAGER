import type { Request, Response, NextFunction } from "express";
import * as skillService from "./skill.service.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const initializeSkills = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { skills } = req.body;
    const result = await skillService.initUserSkills(req.userId!, skills);

    res.status(201).json({
      success: true,
      message: "Skills initialized successfully",
      skills: result,
    });
  } catch (error) {
    next(error);
  }
};

export const categorizeSkills = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await skillService.getCategorizedUserSkills(req.userId!);

    res.status(200).json({
      success: true,
      message: "Skills categorized successfully",
      categorizedSkills: result,
    });
  } catch (error) {
    next(error);
  }
};

export const boostSkills = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { skillName, level } = req.body;

    if (!skillName || !level) {
      throw new AppError("Skill name and test level are required.", 400);
    }

    const result = await skillService.applySkillBoost(
      req.userId!,
      skillName,
      level,
    );

    res.status(200).json({
      success: true,
      message: "Skill boosted successfully",
      newScore: result,
    });
  } catch (error) {
    next(error);
  }
};
