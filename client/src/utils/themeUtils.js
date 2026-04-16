export const getScoreColors = (score = 0) => {
  const hue = Math.floor((score / 100) * 120);

  return {
    scoreColor: `hsl(${hue}, 80%, 50%)`,
    scoreShadow: `hsla(${hue}, 80%, 50%, 0.4)`,
  };
};

export const getDashboardOffset = (
  score = 0,
  loading = true,
  circumference = 2 * Math.PI * 90,
) => {
  if (loading) {
    return circumference;
  }

  return circumference - (score / 100) * (circumference * 0.75);
};
