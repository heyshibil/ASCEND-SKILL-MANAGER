/**
 * formula: P(t) = P0 * e^(-t/S)
 * @param baselineScore (P0) - Initial proficiency when last verified.
 * @param lastVerifiedAt - The date of the last code commit or task completion.
 * @param stabilityConstant (S) - The 'resistance' to forgetting
 * @param masteryMultiplier - A bonus that slows decay for long-term experts.
 */

export const calculateCurrentScore = (
  baselineScore: number,
  lastVerifiedAt: Date,
  stabilityConstant: number,
  masteryMultiplier: number = 1.0,
): number => {
  const now = new Date();

  // Calculate t (time elapsed in days)
  const timeDiff = now.getTime() - lastVerifiedAt.getTime();
  const t = Math.max(0, timeDiff / (1000 * 60 * 60 * 24));

  // Effective Stability (S)
  const S = stabilityConstant * masteryMultiplier;

  // Decay formula
  const decayedScore = baselineScore * Math.exp(-t / S);

  const finalScore = Math.round(decayedScore * 10) / 10;
  return finalScore < 1 ? 0 : finalScore;
};

/**
 * Delta-based decay — calculates the DROP for a given time interval.
 * Used by the background decay engine so that boosts aren't overwritten.
 *
 * Formula: drop = currentScore × (1 - e^(-Δt / S))
 *
 * @param currentScore - The skill's live score right now
 * @param deltaHours - Hours since the last decay tick
 * @param stabilityConstant - Resistance to forgetting
 * @param masteryMultiplier - Expert bonus multiplier
 * @returns The amount to subtract from currentScore
 */

export const calculateDecayDelta = (
  currentScore: number,
  deltaHours: number,
  stabilityConstant: number,
  masteryMultiplier: number = 1,
): number => {
  if (currentScore <= 0 || deltaHours <= 0) return 0;

  const S = stabilityConstant * masteryMultiplier;
  const deltaInDays = deltaHours / 24;

  const drop = currentScore * (1 - Math.exp(-deltaInDays / S));

  return Math.round(drop * 10) / 10;
};

/**
 * Dependency cascade — how much a parent skill's drop affects a child.
 *
 * Formula: childDrop = parentDrop × impactRatio × (parentStability / childStability)
 *
 * Rationale: If a foundational skill (high S) drops, frameworks built on it
 * (lower S) should feel a proportionally larger impact.
 *
 * @param parentDrop - How much the parent skill dropped this tick
 * @param parentStability - Parent's stability constant
 * @param childStability - Child's stability constant
 * @param impactRatio - Max fraction of parent drop that cascades (default 0.35)
 * @returns The additional drop to apply to the child skill
 */

export const calculateDependencyDrop = (
  parentDrop: number,
  parentStability: number,
  childStability: number,
  impactRatio: number = 0.35,
) => {
  if (parentDrop <= 0) return 0;

  const stabilityRatio = Math.min(parentStability / childStability, 2.0);
  const cascadeDrop = parentDrop * impactRatio * stabilityRatio;

  return Math.round(cascadeDrop * 10) / 10
};
