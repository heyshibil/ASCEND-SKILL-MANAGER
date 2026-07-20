
export const queryKeys = {
  // Dashboard — one global entry per user (auth cookie scopes it server-side)
  dashboard: () => ["dashboard"],

  // Leaderboard — separate cache entry per mode (solved / streak / score)
  leaderboard: (mode) => ["leaderboard", mode],

  // Problem stats (totalSolved, streak, etc.)
  problemStats: () => ["problemStats"],

  // Problems list — one entry per filter combination
  problems: (filters) => ["problems", filters],

  // Notifications — separate cache entry per status (unread / read)
  notifications: (status) => ["notifications", status],
};

