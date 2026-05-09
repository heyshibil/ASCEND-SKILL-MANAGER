import React, { useEffect } from "react";
import {
  Users,
  Code,
  Activity,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminStore } from "../../store/useAdminStore";

// Custom time formatter matching UsersManagement.jsx logic
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "Unknown";
  const now = new Date();
  const past = new Date(dateInput);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`; // up to 30 days
  return past.toLocaleDateString();
};

export default function AdminDashboard() {
  const {
    metrics,
    recentUsers,
    chartData,
    timeframe,
    loadingBase,
    loadingCharts,
    fetchDashboardBase,
    setTimeframe,
  } = useAdminStore();

  useEffect(() => {
    fetchDashboardBase();
    setTimeframe("days"); // Trigger initial chart fetch
  }, [fetchDashboardBase, setTimeframe]);

  if (loadingBase && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Platform Users",
      value: metrics?.totalUsers || 0,
      change: "Live",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Total Skills",
      value: metrics?.totalSkills || 0,
      change: "Live",
      isPositive: true,
      icon: Code,
    },
    {
      title: "Coding Problems",
      value: metrics?.totalQuestions || 0,
      change: "Live",
      isPositive: true,
      icon: Activity,
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "Stable",
      isPositive: true,
      icon: Server,
    },
  ];

  const currentChartData = chartData[timeframe] || {
    userGrowth: [],
    liquidity: [],
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
            System operations
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Real-time overview of the Ascend skill verification engine.
          </p>
        </div>
        <div
          className="text-[13px] px-3 py-1.5 rounded-[var(--radius-md)] font-medium flex items-center gap-2"
          style={{ background: "var(--success-bg)", color: "var(--success)" }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
          System operational
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-[var(--radius-lg)] border flex flex-col gap-4 h-[120px] transition-colors hover:bg-[var(--bg-raised)]"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            {/* Top row: title + icon */}
            <div className="flex items-center justify-between">
              <p
                className="text-[12px] font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                {item.title}
              </p>
              <item.icon
                className="w-4 h-4"
                style={{ color: item.color ?? "var(--text-tertiary)" }}
              />
            </div>

            {/* Value */}
            <h3
              className="text-[28px] font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {loadingBase ? "--" : item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity Table (takes up 2 columns) */}
        <div
          className="lg:col-span-2 rounded-[var(--radius-lg)] border overflow-hidden flex flex-col"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="px-6 py-4 border-b flex justify-between items-center"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-raised)",
            }}
          >
            <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
              Recent user onboarding
            </h3>
            <button className="text-[13px] text-[var(--accent)] font-medium hover:underline">
              View all
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead
                className="text-[var(--text-tertiary)] border-b text-[12px] font-medium"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Target role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                {recentUsers?.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[var(--bg-raised)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">
                        {user.username}
                      </p>
                      <p className="text-[12px] text-[var(--text-tertiary)]">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {user.careerGoal}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-[12px] font-medium rounded-[var(--radius-sm)]`}
                        style={{
                          background:
                            user.onboardingStatus === "completed"
                              ? "var(--accent-bg)"
                              : "var(--warning-bg)",
                          color:
                            user.onboardingStatus === "completed"
                              ? "var(--accent)"
                              : "var(--warning)",
                        }}
                      >
                        {user.onboardingStatus === "completed"
                          ? "Completed"
                          : "Onboarding"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] text-right">
                      {formatTimeAgo(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts Side Panel */}
        <div
          className="rounded-[var(--radius-lg)] border flex flex-col"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-raised)",
            }}
          >
            <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
              System alerts
            </h3>
          </div>
          <div className="p-6 flex flex-col gap-5 flex-1">
            {[
              {
                title: "MongoDB Indexes optimized",
                time: "10 mins ago",
                type: "info",
              },
              {
                title: "High memory usage detected",
                time: "1 hour ago",
                type: "warning",
              },
              {
                title: "Github API rate limit near",
                time: "3 hours ago",
                type: "danger",
              },
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0`}
                  style={{
                    background:
                      alert.type === "danger"
                        ? "var(--danger)"
                        : alert.type === "warning"
                          ? "var(--warning)"
                          : "var(--accent)",
                  }}
                />
                <div>
                  <p className="text-[14px] font-medium text-[var(--text-primary)] leading-none">
                    {alert.title}
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5">
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-auto p-4 border-t"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button className="w-full py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              View all alerts
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth Chart */}
        <div
          className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-6"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                User Growth
              </h3>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Cumulative platform registrations
              </p>
            </div>
            <div className="flex gap-1 bg-[var(--bg-raised)] p-1 rounded-[var(--radius-md)]">
              {["days", "week", "month"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`text-[12px] font-medium px-3 py-1 rounded-[var(--radius-sm)] capitalize transition-all ${timeframe === tf ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[250px] w-full relative">
            {loadingCharts && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-surface)] bg-opacity-50 backdrop-blur-sm">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentChartData.userGrowth}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-subtle)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "var(--accent)",
                    stroke: "var(--bg-surface)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Liquidity Score Chart */}
        <div
          className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-6"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                Avg Career Liquidity
              </h3>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Platform-wide score health
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full relative">
            {loadingCharts && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-surface)] bg-opacity-50 backdrop-blur-sm">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentChartData.liquidity}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--success)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--success)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-subtle)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--success)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
