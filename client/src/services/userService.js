import { API } from "./api";

export const userService = {
  updateProfile: async (payload) => {
    const { data } = await API.patch("/users/profile", payload);
    return data;
  },
  requestEmailChange: async (email) => {
    const { data } = await API.post("/users/email-change/request", { email });
    return data;
  },
  verifyEmailChange: async (token) => {
    const { data } = await API.get(`/users/email-change/verify/${token}`);
    return data;
  },
  requestPasswordChange: async (payload) => {
    const { data } = await API.post("/users/password-change/request", payload);
    return data;
  },
  verifyPasswordChange: async (token) => {
    const { data } = await API.get(`/users/password-change/verify/${token}`);
    return data;
  },
};
