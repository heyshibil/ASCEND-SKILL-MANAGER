import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { toast } from "sonner";

const useAuthStore = create(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: true,

      checkAuth: async () => {
        set({ isCheckingAuth: true }, false, "auth/checkStart");
        try {
          const { user } = await authService.getMe();
          set(
            { user, isAuthenticated: true, isCheckingAuth: false },
            false,
            "auth/checkSuccess",
          );
        } catch {
          set(
            { user: null, isAuthenticated: false, isCheckingAuth: false },
            false,
            "auth/checkFail",
          );
        }
      },

      login: async (email, password) => {
        const data = await authService.login(email, password);
        set({ user: data.user, isAuthenticated: true }, false, "auth/login");
        return data;
      },

      register: async (userData) => {
        const data = await authService.register(userData);
        return data;
      },

      updateProfile: async (payload) => {
        const data = await userService.updateProfile(payload);
        set({ user: data.user }, false, "auth/updateProfile");
        toast.success(data.message || "Profile updated successfully");
        return data;
      },

      requestEmailChange: async (email) => {
        const data = await userService.requestEmailChange(email);
        toast.success(data.message || "Verification email sent");
        return data;
      },

      verifyEmailChange: async (token) => {
        const data = await userService.verifyEmailChange(token);
        if (get().isAuthenticated && data.user) {
          set({ user: data.user }, false, "auth/verifyEmailChange");
        }
        return data;
      },

      requestPasswordChange: async (payload) => {
        const data = await userService.requestPasswordChange(payload);
        toast.success(data.message || "Password verification email sent");
        return data;
      },

      verifyPasswordChange: async (token) => {
        const data = await userService.verifyPasswordChange(token);
        return data;
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
         
        }
        set({ user: null, isAuthenticated: false }, false, "auth/logout");
        toast.info("Logged out successfully");
      },
    }),
    { name: "AuthStore" },
  ),
);

export default useAuthStore;
