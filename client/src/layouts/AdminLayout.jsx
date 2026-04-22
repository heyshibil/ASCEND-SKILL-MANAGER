// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  RotateCw,
  Bell,
  LayoutDashboard,
  Users,
  Layers, // Using for Skills
  TrendingUp, // Using for Market
  HelpCircle, // Using for Questions
  LogOut,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import LogoutModal from "../components/LogoutModal";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const username = user?.username || "Admin User";
  const displayInitial = username.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      isActive
        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
    }`;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* --- Left Sidebar (Light Mode) --- */}
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shadow-sm z-10">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3 shadow-md shadow-indigo-600/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            Ascend <span className="text-indigo-600 font-medium">Ops</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <p className="px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Management
          </p>
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-4 h-4" /> Users
          </NavLink>
          <NavLink to="/admin/skills" className={navLinkClass}>
            <Layers className="w-4 h-4" /> Skills
          </NavLink>
          
          <p className="px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4 mb-2">
            Data Architecture
          </p>
          <NavLink to="/admin/market" className={navLinkClass}>
            <TrendingUp className="w-4 h-4" /> Market
          </NavLink>
          <NavLink to="/admin/questions" className={navLinkClass}>
            <HelpCircle className="w-4 h-4" /> Questions
          </NavLink>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all font-medium text-sm shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            {/* Optional breadcrumb or title here */}
            Overview
          </div>

          <div className="flex items-center gap-4">
            {/* App's Sync Button */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm text-sm font-medium group">
              <RotateCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              Sync
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 ml-2">
              <div className="text-right hidden xl:block mr-1">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {username}
                </p>
                  {/* <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    Administrator
                  </p> */}
              </div>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={username}
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-sm object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                  {displayInitial}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet for Pages */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          <Outlet />
        </main>
      </div>
      
      {/* Logout Modal - uses your existing component */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
