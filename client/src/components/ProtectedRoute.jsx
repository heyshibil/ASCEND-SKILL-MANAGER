import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-canvas)]">
        <Loader2 className="animate-spin text-[var(--accent)] w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Enforce Onboarding Routing for Protected Routes
  const currentPath = location.pathname;
  if (user && user.role !== "admin") {
    if (user.onboardingStatus === "pending_test" && !currentPath.includes("/test")) {
      return <Navigate to={`/test?skill=${encodeURIComponent(user.coreLanguage || 'JavaScript')}`} replace />;
    }
    if (user.onboardingStatus === "pending_discovery" && !currentPath.includes("/discovery") && !currentPath.includes("/test")) {
      return <Navigate to="/discovery" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
