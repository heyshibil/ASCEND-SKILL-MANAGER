import { API } from "./api";

export const authService = {
  login: async (email, password) => {
    const { data } = await API.post(`/auth/login`, { email, password });
    return data;
  },
  register: async (userData) => {
    const { data } = await API.post("/auth/register", userData);
    return data;
  },
  logout: async () => {
    await API.post("/auth/logout");
  },
  getMe: async () => {
    const { data } = await API.get("/auth/me");
    return data;
  },
  verifyEmail: async (token) => {
    const { data } = await API.get(`/auth/verify-email/${token}`);
    return data;
  },
};
