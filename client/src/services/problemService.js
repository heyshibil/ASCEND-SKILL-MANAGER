import { API } from "./api";

export const problemService = {
  listProblems: async (params = {}) => {
    const { data } = await API.get("/problems", { params });
    return data;
  },

  getProblem: async (questionId) => {
    const { data } = await API.get(`/problems/${questionId}`);
    return data;
  },

  runProblem: async (questionId, code) => {
    const { data } = await API.post(`/problems/${questionId}/run`, { code });
    return data;
  },

  submitProblem: async (questionId, code) => {
    const { data } = await API.post(`/problems/${questionId}/submit`, {
      code,
    });
    return data;
  },

  getUserStats: async () => {
    const { data } = await API.get("/problems/user/stats");
    return data;
  },
};
