export const SKILL_THRESHOLDS = {
  HEALTHY_MIN: 70,
  DRAINING_MIN: 31,
  DEBT_MAX: 30,
};

export const BOOST_HIKES = {
  MCQ: 5,
  CODE_BEGINNER: 10,
  CODE_INTERMEDIATE: 25,
  CODE_ADVANCED: 50,
};

export const determineSkillStatus = (
  score: number,
): "healthy" | "draining" | "debt" => {
  if (score >= SKILL_THRESHOLDS.HEALTHY_MIN) return "healthy";
  if (score >= SKILL_THRESHOLDS.DRAINING_MIN) return "draining";
  return "debt";
};
