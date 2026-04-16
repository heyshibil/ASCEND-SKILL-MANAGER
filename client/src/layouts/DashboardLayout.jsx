import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  RotateCw,
  Bell,
  LayoutDashboard,
  Sliders,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import useDashboardData from "../hooks/useDashboardData";
import LogoutModal from "../components/LogoutModal";
import useAuthStore from "../store/useAuthStore";

export default function DashboardLayout() {
  const { data } = useDashboardData();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const username = user?.username || "Guest";
  const displayInitial = user?.username.charAt(0).toUpperCase() || "G";

  // Logout handler
  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#0b0b0f] text-slate-300 font-sans overflow-hidden">
      {/* --- Left Sidebar --- */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-black/20">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
            <svg
              className="w-5 h-5 text-indigo-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">
            Ascend
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <p className="px-3 text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-2">
            Navigation
          </p>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/skill-control"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Sliders className="w-4 h-4" />
            Skill Control
          </NavLink>

          <NavLink
            to="/dashboard/market-intel"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
          >
            <TrendingUp className="w-4 h-4" />
            Market Intel
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
        </nav>

        {/* Quick Stats Panel */}
        <div className="p-4 mb-4 mx-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-3">
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            Quick Stats
          </p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Critical Debts</span>
            <span className="text-red-400 font-semibold font-mono">
              {data.skillDebts.critical}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Draining Skills</span>
            <span className="text-amber-400 font-semibold font-mono">
              {data.skillDebts.drainingSkills}
            </span>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 mt-auto mb-6 w-full">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/10 bg-red-500/[0.02] text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all group cursor-pointer"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-4">
            {/* <h1 className="text-lg font-semibold text-white">Dashboard <span className="text-slate-600 mx-2">—</span> <span className="text-slate-400 font-normal text-sm tracking-wide">Career readiness overview</span></h1> */}
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative group hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search skills..."
                className="bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-12 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-white/10 rounded px-1.5 py-0.5 bg-black/40">
                <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors cursor-pointer">
              <RotateCw className="w-3.5 h-3.5" />
              Sync
            </button>

            <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-white/10 ml-2">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={username}
                  className="w-7 h-7 rounded-full border border-white/10 shadow-lg cursor-pointer object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 shadow-lg cursor-pointer">
                  {displayInitial}
                </div>
              )}
              <span className="text-sm font-medium text-slate-200 hidden xl:block">
                {username}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Outlet */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Ambient Top Glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
          <Outlet />
        </main>
      </div>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
