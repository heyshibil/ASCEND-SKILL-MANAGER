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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[640px] rounded-[var(--radius-xl)] overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
              Boost {skill.name}
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              Current score: <span className="text-[var(--accent)] font-medium">{skill.currentScore}%</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex flex-col gap-6">
          {!isDebt && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[var(--success)]" /> Theory route
              </h3>
              <button
                onClick={handleMcqBoost}
                className="w-full text-left p-4 rounded-[var(--radius-lg)] border transition-colors flex justify-between items-center group hover:bg-[var(--bg-raised)]"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <h4 className="text-[14px] font-medium text-[var(--text-primary)]">Quick MCQ (+5%)</h4>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    Take a quick 5 question quiz.
                  </p>
                </div>
                <Zap className="w-4 h-4 text-[var(--success)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
              <Code className="w-4 h-4 text-[var(--accent)]" /> Compiler challenge
              {isDebt && (
                <span className="ml-2 px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  Required for debts
                </span>
              )}
            </h3>

            <div className="flex flex-col gap-3">
              {[
                { level: "beginner", label: "Beginner (+10%)", desc: "Basic syntax and problem solving." },
                { level: "intermediate", label: "Intermediate (+25%)", desc: "Algorithms and data structures." },
                { level: "advanced", label: "Advanced (+50%)", desc: "Complex logic and optimization." },
              ].map((item) => (
                <button
                  key={item.level}
                  onClick={() => handleCompilerTest(item.level)}
                  className="w-full text-left p-4 rounded-[var(--radius-lg)] border transition-colors flex justify-between items-center hover:bg-[var(--bg-raised)]"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <h4 className="text-[14px] font-medium text-[var(--text-primary)]">{item.label}</h4>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
