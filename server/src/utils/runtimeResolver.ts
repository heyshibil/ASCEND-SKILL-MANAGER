// -- Runtime mapping -- Determines which Lambda runtime a skill should execute on.

const SKILL_RUNTIME_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "javascript",
  "node.js": "javascript",
  react: "javascript",
  express: "javascript",
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

export const resolveRuntime = (skillName: string): string => {
  return SKILL_RUNTIME_MAP[skillName.toLowerCase()] || "javascript";
};