export const getSkillDefaults = (skillName: string) => {
  const normalized = skillName.toLowerCase();

  const dictionary: Record<
    string,
    {
      category: "Foundational" | "Framework" | "Tooling" | "Language";
      stabilityConstant: number;
    }
  > = {
    react: { category: "Framework", stabilityConstant: 60 },
    "node.js": { category: "Framework", stabilityConstant: 85 },
    javascript: { category: "Language", stabilityConstant: 90 },
    express: { category: "Framework", stabilityConstant: 70 },
    mongodb: { category: "Tooling", stabilityConstant: 75 },
    typescript: { category: "Language", stabilityConstant: 85 },
    html: { category: "Foundational", stabilityConstant: 120 },
    css: { category: "Foundational", stabilityConstant: 100 },
    "next.js": { category: "Framework", stabilityConstant: 85 },
    "redux": { category: "Tooling", stabilityConstant: 70 },
    "zustand": { category: "Tooling", stabilityConstant: 80 },
    "tailwind css": { category: "Tooling", stabilityConstant: 85 },
    "c#": { category: "Language", stabilityConstant: 90 },
    ".net": { category: "Framework", stabilityConstant: 85 },
    "sql server": { category: "Tooling", stabilityConstant: 85 },
    python: { category: "Language", stabilityConstant: 90 },
    django: { category: "Framework", stabilityConstant: 85 },
    postgresql: { category: "Tooling", stabilityConstant: 90 },
  };

  return (
    dictionary[normalized] || { category: "Tooling", stabilityConstant: 70 }
  );
};
