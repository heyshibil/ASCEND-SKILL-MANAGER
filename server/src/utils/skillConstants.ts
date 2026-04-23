export const SKILL_THRESHOLDS = {
  HEALTHY_MIN: 70,
  DRAINING_MIN: 31,
  DEBT_MAX: 30,
};

export const determineSkillStatus = (
  score: number,
): "healthy" | "draining" | "debt" => {
  if (score >= SKILL_THRESHOLDS.HEALTHY_MIN) return "healthy";
  if (score >= SKILL_THRESHOLDS.DRAINING_MIN) return "draining";
  return "debt";
};
