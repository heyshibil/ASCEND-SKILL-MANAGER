import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authService } from "../services/authService";
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
        } catch (error) {
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

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {}
        set({ user: null, isAuthenticated: false }, false, "auth/logout");
        toast.info("Logged out successfully");
      },
    }),
    { name: "AuthStore" },
  ),
);

export default useAuthStore;
