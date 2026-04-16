import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Zap,
  CheckCircle2,
  Flame,
  Star,
} from "lucide-react";
import useDashboardData from "../hooks/useDashboardData";
import { getDashboardOffset, getScoreColors } from "../utils/themeUtils";
import { getIconForSkill } from "../utils/iconMap";

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

export default function DashboardHome() {
  const { data, error, loading } = useDashboardData();
  const score = data?.score || 0;
  const circumference = 2 * Math.PI * 90;

  const { scoreColor, scoreShadow } = getScoreColors(score);
  const dashOffset = getDashboardOffset(score, loading, circumference);

  // -- Hot skills section --
  const hotSkills = [
    { name: "TypeScript", demand: "+18%", roles: 2980 },
    { name: "Next.js", demand: "+24%", roles: 2150 },
    { name: "Go", demand: "+31%", roles: 1540 },
    { name: "LLM/AI", demand: "+67%", roles: 2700 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto flex flex-col gap-6"
    >
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">
              Active Skills
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {loading ? "--" : data?.activeSkills || 0}
            </h3>
            {/* <span className="text-xs text-slate-500 font-medium">
              +2 this month
            </span> */}
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">
              Skill Debts
            </span>
            <div className="p-1.5 rounded-lg bg-red-400/10 text-red-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {loading ? "--" : data?.skillDebts?.total || 0}
            </h3>
            {/* <span className="text-xs text-slate-500 font-medium">
              {data?.skillDebts.critical} Critcial debts
            </span> */}
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">
              Tasks Completed
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">23</h3>
            {/* <span className="text-xs text-slate-500 font-medium">
              this week
            </span> */}
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">
              Hot Market Skills
            </span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">3</h3>
            {/* <span className="text-xs text-slate-500 font-medium">
              Trending in stack
            </span> */}
          </div>
        </motion.div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Liquidity Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Career Liquidity Score
              </p>
              <h2 className="text-sm font-medium text-slate-400 mt-1">
                Overall career readiness & market alignment index
              </h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20">
              Good
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative mb-4">
            <div
              className="relative w-64 h-64 flex items-center justify-center rounded-full"
              style={{ boxShadow: `0 0 80px ${scoreShadow}` }}
            >
              {/* Circular Animation Frame */}
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-225"
                viewBox="0 0 200 200"
              >
                {/* Background Track (Partial) */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="12"
                  strokeDasharray={`${circumference * 0.75} ${circumference}`}
                  strokeLinecap="round"
                />

                {/* Animated Foreground */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeDasharray={`${circumference} ${circumference}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                  className="drop-shadow-lg"
                />
              </svg>

              <div className="flex flex-col items-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-6xl font-bold tracking-tighter"
                  style={{ color: scoreColor }}
                >
                  {loading ? "--" : score}
                </motion.span>
                <span className="text-slate-500 text-xs tracking-widest font-medium mt-1">
                  /100
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Skills Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-medium">Top Skills</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Visual battery charge
                </p>
              </div>
              <Star className="w-5 h-5 text-amber-500/70" />
            </div>

            <div className="flex flex-col gap-5">
              {(data?.topSkills || []).map((skill, i) => {
                const skillHue = Math.floor(((skill.score || 0) / 100) * 120);
                const skillColor = `hsl(${skillHue}, 80%, 50%)`;
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm p-1.5 rounded-lg bg-white/5 shadow"
                          style={{ color: skillColor }}
                        >
                          {getIconForSkill(skill.name)}
                        </span>
                        <span className="text-sm font-medium text-slate-200">
                          {skill.name}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: skillColor }}
                      >
                        {skill.score}%
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.score}%` }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: skillColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/20 transition-colors cursor-pointer">
            Boost skills
          </button>
        </motion.div>

        {/* Hot Market Skills Panel */}
        <motion.div
          variants={itemVariants}
          className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-medium">Hot Market Skills</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trending in the industry
                </p>
              </div>
              <Flame className="w-5 h-5 text-orange-500/70" />
            </div>

            <div className="flex flex-col gap-3">
              {hotSkills.map((skill, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-default"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-200 text-sm">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {skill.roles} open roles
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-emerald-400 font-bold text-sm">
                      {skill.demand}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Demand
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            More skills
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
