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

// Career score
export const getScoreLabel = (score) => {
  if (score <= 20)
    return { label: "Critical", bg: "var(--error-bg)", color: "var(--error)" };
  if (score <= 40)
    return { label: "At Risk", bg: "var(--error-bg)", color: "#FB923C" };
  if (score <= 60)
    return { label: "Fair", bg: "var(--warning-bg)", color: "var(--warning)" };
  if (score <= 75)
    return { label: "Good", bg: "var(--warning-bg)", color: "var(--warning)" };
  if (score <= 90)
    return {
      label: "Strong",
      bg: "var(--success-bg)",
      color: "var(--success)",
    };
  return {
    label: "Excellent",
    bg: "var(--success-bg)",
    color: "var(--success)",
  };
};
