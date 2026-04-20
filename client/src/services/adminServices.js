import { API } from "./api";

export const adminService = {
  createQuestion: async (questionData) => {
    const { data } = await API.post("/admin/questions", questionData);
    return data;
  },

  // future calls..
};
