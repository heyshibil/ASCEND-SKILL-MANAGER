/**
 * formula: P(t) = P0 * e^(-t/S)
 * @param baselineScore (P0) - Initial proficiency when last verified.
 * @param lastVerifiedAt - The date of the last code commit or task completion.
 * @param stabilityConstant (S) - The 'resistance' to forgetting (e.g., 100 for JS, 40 for a niche library).
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
