import React from "react";
import { motion } from "framer-motion";
import { X, Code, CheckSquare, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSkillStore } from "../../store/useSkillStore";

export default function BoostModal({ isOpen, onClose, skill, isDebt }) {
  const navigate = useNavigate();
  const boostSkillFast = useSkillStore((state) => state.boostSkillFast);

  if (!isOpen || !skill) return null;

  const handleMcqBoost = async () => {
    navigate(`/dashboard/boost/mcq?skill=${encodeURIComponent(skill.name)}`);
    onClose();
  };

  const handleCompilerTest = (level) => {
    navigate(
      `/dashboard/boost/compiler?skill=${encodeURIComponent(skill.name)}&level=${level}`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0b0b0f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Boost {skill.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Current Score:{" "}
              <span className="text-indigo-400 font-bold">
                {skill.currentScore}%
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {!isDebt && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Theory
                Route
              </h3>
              <button
                onClick={handleMcqBoost}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex justify-between items-center group"
              >
                <div>
                  <h4 className="text-white font-medium">Quick MCQ (+5%)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Take a quick 5 question quiz.
                  </p>
                </div>
                <Zap className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" /> Compiler Challenge
              {isDebt && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                  Required for Debts
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleCompilerTest("beginner")}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h4 className="text-white font-medium">Beginner (+10%)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Basic syntax and problem solving.
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleCompilerTest("intermediate")}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h4 className="text-white font-medium text-indigo-100">
                    Intermediate (+25%)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Algorithms and data structures.
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleCompilerTest("advanced")}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 transition-all flex justify-between items-center"
              >
                <div>
                  <h4 className="text-white font-medium text-fuchsia-100">
                    Advanced (+50%)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Complex logic and optimization.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
