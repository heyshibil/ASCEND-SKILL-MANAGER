import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import VerifyEmail from "./pages/VerifyEmail";
import SkillSelect from "./pages/SkillSelect";
import VerificationTest from "./pages/VerificationTest"
import ScoreReport from "./pages/ScoreReport";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/verify-email/:token",
    element: <VerifyEmail />,
  },
  {
    path: "/discovery",
    element: <SkillSelect />,
  },
  {
    path: "/test",
    element: <VerificationTest />,
  },
  {
    path: "/report",
    element: <ScoreReport />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [{ index: true, element: <DashboardHome /> }],
  },
]);
