// -- Runtime mapping -- Determines which Lambda runtime a skill should execute on.

const SKILL_RUNTIME_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "javascript",
  "node.js": "javascript",
  react: "javascript",
  express: "JavaScript",
  mongodb: "javascript",
  "next.js": "javascript",
  redux: "javascript",
  zustand: "javascript",
  "tailwind css": "javascript",
  html: "javascript",
  css: "javascript",
  python: "python",
  django: "python",
};

const SKILL_FALLBACK_MAP: Record<string, string> = {
  react: "JavaScript",
  express: "JavaScript",
  "node.js": "JavaScript",
  "next.js": "JavaScript",
  redux: "JavaScript",
  zustand: "JavaScript",
  mongodb: "JavaScript",
  typescript: "JavaScript",
  "tailwind css": "JavaScript",
  django: "Python",
};

export const resolveRuntime = (skillName: string): string => {
  return SKILL_RUNTIME_MAP[skillName.toLowerCase()] || "javascript";
};

export const getFallbackSkill = (skillName: string): string | null => {
  return SKILL_FALLBACK_MAP[skillName.toLowerCase()] || null;
};
