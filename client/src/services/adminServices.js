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

  // Users Management
  getAllUsers: async (params = {}) => {
    const { data } = await API.get("/users/admin/all", { params });
    return data;
  },

  updateUserStatus: async (userId, status) => {
    const { data } = await API.patch(`/users/admin/status/${userId}`, { status });
    return data;
  },

  // Skill Presets
  getSkillPresets: async (params = {}) => {
    const { data } = await API.get("/skills/admin/catalog", { params });
    return data;
  },

  createSkillPreset: async (payload) => {
    const { data } = await API.post("/skills/admin/catalog", payload);
    return data;
  },

  updateSkillPreset: async (skillId, payload) => {
    const { data } = await API.patch(`/skills/admin/catalog/${skillId}`, payload);
    return data;
  },

  deleteSkillPreset: async (skillId) => {
    const { data } = await API.delete(`/skills/admin/catalog/${skillId}`);
    return data;
  },
};
