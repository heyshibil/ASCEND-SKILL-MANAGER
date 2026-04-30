import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Zap, CheckCircle2, Flame, Star } from "lucide-react";
import useDashboardData from "../hooks/useDashboardData";
import { getDashboardOffset, getScoreColors } from "../utils/themeUtils";
import { getIconForSkill } from "../utils/iconMap";
import { useMarketStore } from "../store/useMarketStore";

// Animation variants for smooth mounting
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Helper: zero-pad a number to 2 digits
const pad = (n) => String(n).padStart(2, '0');

export default function DashboardHome() {
  const { data, error, loading } = useDashboardData();
  const score = data?.score || 0;
  const circumference = 2 * Math.PI * 90;

  const { scoreColor, scoreShadow } = getScoreColors(score);
  const dashOffset = getDashboardOffset(score, loading, circumference);


  const hotSkills = useMarketStore((state) => state.skills);
  const topFiveHotSkills = [...hotSkills]
    .sort((a, b) => Number(b.demandPercentage) - Number(a.demandPercentage))
    .slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto flex flex-col gap-8"
    >
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 — Active Skills */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-[var(--radius-lg)] border flex flex-col justify-between h-[120px] transition-colors hover:bg-[var(--bg-raised)]"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em]">
              Active skills
            </span>
            <Activity className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-[28px] font-medium text-[var(--text-primary)] tracking-tight">
              {loading ? "--" : pad(data?.activeSkills || 0)}
            </h3>
          </div>
        </motion.div>

        {/* Card 2 — Decaying Skills */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-[var(--radius-lg)] border flex flex-col justify-between h-[120px] transition-colors hover:bg-[var(--bg-raised)]"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em]">
              Decaying skills
            </span>
            <Zap className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div>
            <h3 className="text-[28px] font-medium text-[var(--text-primary)] tracking-tight">
              {loading ? "--" : pad(data?.skillDebts?.total || 0)}
            </h3>
          </div>
        </motion.div>

        {/* Card 3 — Tasks Completed */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-[var(--radius-lg)] border flex flex-col justify-between h-[120px] transition-colors hover:bg-[var(--bg-raised)]"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em]">
              Tasks completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div>
            <h3 className="text-[28px] font-medium text-[var(--text-primary)] tracking-tight">{pad(23)}</h3>
          </div>
        </motion.div>

        {/* Card 4 — Hot Market Skills */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-[var(--radius-lg)] border flex flex-col justify-between h-[120px] transition-colors hover:bg-[var(--bg-raised)]"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em]">
              Hot market skills
            </span>
            <Flame className="w-4 h-4 text-[#FB923C]" />
          </div>
          <div>
            <h3 className="text-[28px] font-medium text-[var(--text-primary)] tracking-tight">{pad(3)}</h3>
          </div>
        </motion.div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Career Liquidity Panel — no card bg/border */}
        <motion.div
          variants={itemVariants}
          className="p-6 flex flex-col"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--text-tertiary)]">
                Career liquidity score
              </p>
              <h2 className="text-[13px] text-[var(--text-secondary)] mt-1">
                Overall career readiness & market alignment index
              </h2>
            </div>
            <div className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              Good
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative mb-4 mt-4">
            <div className="relative w-72 h-72 flex items-center justify-center rounded-full">
              {/* SVG Gauge with gradient */}
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-225"
                viewBox="0 0 200 200"
              >
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>

                {/* Background Track */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="10"
                  strokeDasharray={`${circumference * 0.75} ${circumference}`}
                  strokeLinecap="round"
                />

                {/* Animated Foreground with gradient */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="10"
                  strokeDasharray={`${circumference} ${circumference}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                />
              </svg>

              <div className="flex flex-col items-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-[60px] font-medium tracking-tighter text-[var(--text-primary)]"
                >
                  {loading ? "--" : score}
                </motion.span>
                <span className="text-[15px] text-[var(--text-tertiary)] tracking-wide font-medium mt-1">
                  /100
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Skills Panel */}
        <motion.div
          variants={itemVariants}
          className="rounded-[var(--radius-lg)] border p-6 flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-medium text-[var(--text-primary)]">Top skills</h3>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                  Visual battery charge
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {(data?.topSkills || []).map((skill, i) => {
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] p-1.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-raised)' }}>
                          {getIconForSkill(skill.name)}
                        </span>
                        <span className="text-[14px] font-medium text-[var(--text-primary)]">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-[var(--text-secondary)] font-[var(--font-mono)]">
                        {skill.score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.score}%` }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-green-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full mt-8 h-9 rounded-[var(--radius-md)] border text-[var(--text-secondary)] text-[14px] font-medium hover:bg-[var(--bg-raised)] transition-colors" style={{ borderColor: 'var(--border-base)' }}>
            Boost skills
          </button>
        </motion.div>

        {/* Hot Market Skills Panel */}
        <motion.div
          variants={itemVariants}
          className="rounded-[var(--radius-lg)] border p-6 flex flex-col justify-between"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-medium text-[var(--text-primary)]">Hot market skills</h3>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                  Trending in the industry
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {topFiveHotSkills.map((skill, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 180, damping: 28 }}
                    key={skill._id}
                    className="p-3 rounded-[var(--radius-md)] border flex items-center justify-between transition-colors hover:bg-[var(--bg-raised)] cursor-default"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[var(--text-primary)] text-[14px]">
                        {skill.skillName}
                      </span>
                      {/* <span className="text-[12px] text-[#FB923C] font-[var(--font-mono)]">
                        {skill.openRoles} Openroles
                      </span> */}
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[#34D399] font-medium text-[14px] font-[var(--font-mono)]">
                        {skill.demandPercentage}%
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] tracking-wide">
                        Demand
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <button className="w-full mt-8 h-9 rounded-[var(--radius-md)] border text-[var(--text-secondary)] text-[14px] font-medium hover:bg-[var(--bg-raised)] transition-colors" style={{ borderColor: 'var(--border-base)' }}>
            More skills
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
