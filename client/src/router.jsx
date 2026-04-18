import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import VerifyEmail from "./pages/VerifyEmail";
import SkillSelect from "./pages/SkillSelect";
import VerificationTest from "./pages/VerificationTest";
import ScoreReport from "./pages/ScoreReport";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Login /> },
      {
        path: "verify-email/:token",
        element: <VerifyEmail />,
      },
      {
        path: "discovery",
        element: <SkillSelect />,
      },
      {
        path: "test",
        element: <VerificationTest />,
      },
      {
        path: "report",
        element: <ScoreReport />,
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [{ index: true, element: <DashboardHome /> }],
      },

      // -- Admin Branch --
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [{ index: true, element: <AdminDashboard /> }],
          },
        ],
      },
    ],
  },
]);
