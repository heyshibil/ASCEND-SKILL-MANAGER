import { API } from "./api";

export const leaderboardService = {
  getGlobalLeaderboard: async ({ mode = "solved", page = 1, limit = 10, signal } = {}) => {
    const { data } = await API.get("/leaderboard", {
      params: { mode, page, limit },
      signal,
    });

    return data.data;
  },
};
