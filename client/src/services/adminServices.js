import { API } from "./api";

export const adminService = {
  createQuestion: async (questionData) => {
    const { data } = await API.post("/admin/questions", questionData);
    return data;
  },

  createBulkQuestions: async (questionsArray) => {
    const { data } = await API.post("/admin/questions/bulk", {
      questions: questionsArray,
    });
    return data;
  },

  // Market
  createMarketSkill: async (formData) => {
    const { data } = await API.post(
      "http://localhost:5000/api/market/trending",
      formData,
      { withCredentials: true },
    );

    return data;
  },

  updateMarketSkill: async (skillId, formData) => {
    const { data } = await API.put(
      `http://localhost:5000/api/market/trending/${skillId}`,
      formData,
      { withCredentials: true },
    );

    return data;
  },

  deleteMarketSkill: async (skillId) => {
    await API.delete(`http://localhost:5000/api/market/trending/${skillId}`, {
      withCredentials: true,
    });
  },
};
