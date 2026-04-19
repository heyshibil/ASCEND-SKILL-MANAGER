import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";
import { Toaster } from "sonner";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster
        theme={isAdminRoute ? "light" : "dark"}
        position="top-center"
        richColors
        duration={3000}
      />
    </>
  );
};

export default App;
