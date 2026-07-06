import { generateNextQuestionId } from "./questions.repository.js";

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

  return generateNextQuestionId(prefix);
};
