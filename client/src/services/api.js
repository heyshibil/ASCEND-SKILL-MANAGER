import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Routes where a 403 is a domain/business error, NOT an auth failure.
// The global interceptor must NOT force-logout on these.
const SKIP_FORCE_LOGOUT_PATHS = [
  "/verification/submit",
  "/verification/boost/mcq/submit",
  "/verification/boost/compiler/submit",
];

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";

    const isAuthFailure = status === 401;
    const isBlockedUser =
      status === 403 &&
      !SKIP_FORCE_LOGOUT_PATHS.some((path) => requestUrl.includes(path));

    if (isAuthFailure || isBlockedUser) {
      import("../store/useAuthStore").then((module) => {
        const store = module.default;
        if (store.getState().isAuthenticated) {
          store.getState().logout();
          window.location.href = "/";
        }
      });
    }

    return Promise.reject(error);
  }
);