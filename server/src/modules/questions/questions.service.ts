import { Question } from "../../models/Question.js";

const SKILL_MAP: Record<string, string> = {
  javascript: "JS",
  typescript: "TS",
  python: "PY",
  "node.js": "NODE",
  react: "REA",
  mongodb: "MDB",
  // expand..
};

export const generateQuestionId = async (
  type: string,
  skill: string,
  level: string,
) => {
  // Safety conversion
  const typePrefix = type === "code" ? "CODE" : "MCQ";
  const skillKey = skill.toLowerCase();

  const safeSkill = SKILL_MAP[skillKey] ?? skill.substring(0, 3).toUpperCase();
  const safeLevel = level.substring(0, 3).toUpperCase();

  const prefix = `${typePrefix}-${safeSkill}-${safeLevel}`;

  const lastQuestion = await Question.findOne({
    questionId: { $regex: `^${prefix}-\\d+$` },
  }).sort({ questionId: -1 });

  let nextNumber = 1;
  if (lastQuestion && lastQuestion.questionId) {
    const match = lastQuestion.questionId.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`;
};
