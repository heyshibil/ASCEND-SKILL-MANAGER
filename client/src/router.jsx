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
import QuestionsManager from "./pages/admin/QuestionsManager";
import AdminMarket from "./pages/admin/AdminMarket";
import UsersManagement from "./pages/admin/UsersManagement";
import SkillControl from "./pages/SkillControl";
import BoostMcqTest from "./pages/BoostMcqTest";
import BoostCompilerTest from "./pages/BoostCompilerTest";
import MarketIntel from "./pages/MarketIntel";

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
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "skill-control", element: <SkillControl /> },
          { path: "boost/mcq", element: <BoostMcqTest /> },
          { path: "boost/compiler", element: <BoostCompilerTest /> },
          { path: "market-intel", element: <MarketIntel /> },
        ],
      },

      // -- Admin Branch --
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "questions", element: <QuestionsManager /> },
              { path: "market", element: <AdminMarket /> },
              { path: "users", element: <UsersManagement /> },
            ],
          },
        ],
      },
    ],
  },
]);
