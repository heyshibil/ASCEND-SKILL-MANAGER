import type { Request, Response, NextFunction } from "express";
import * as skillService from "./skill.service.js";

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
