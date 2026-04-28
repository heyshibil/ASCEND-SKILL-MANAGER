import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Zap, AlertTriangle, Activity } from "lucide-react";
import { useSkillStore } from "../store/useSkillStore";
import AddSkillsModal from "../components/skills/AddSkillsModal";
import BoostModal from "../components/skills/BoostModal";
import { getIconForSkill } from "../utils/iconMap";

export default function SkillControl() {
  const { healthy, draining, debts, fetchSkills, isLoading, deleteSkill } = useSkillStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [boostModalData, setBoostModalData] = useState({ isOpen: false, skill: null, isDebt: false });

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = (skillId, skillName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${skillName}?`)) {
      deleteSkill(skillId);
    }
  };

  const openBoostModal = (skill, isDebt) => {
    setBoostModalData({ isOpen: true, skill, isDebt });
  };

  const SkillCard = ({ skill, type }) => {
    const isDebt = type === "debt";
    const isHealthy = type === "healthy";

    const statusColor = isDebt ? "var(--danger)" : isHealthy ? "var(--success)" : "var(--warning)";
    const statusBg = isDebt ? "var(--danger-bg)" : isHealthy ? "var(--success-bg)" : "var(--warning-bg)";
    const statusLabel = isDebt ? "Debt" : isHealthy ? "Healthy" : "Draining";

    return (
      <div className="p-6 rounded-[var(--radius-lg)] border transition-colors group hover:bg-[var(--bg-raised)] flex flex-col justify-between" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-md)] text-[16px]" style={{ background: 'var(--bg-raised)' }}>
              {getIconForSkill(skill.name)}
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{skill.name}</h3>
              <p className="text-[12px] text-[var(--text-tertiary)]">{skill.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: statusBg, color: statusColor }}>
              {statusLabel}
            </span>
            <button
              onClick={() => handleDelete(skill._id, skill.name)}
              className="text-[var(--text-tertiary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]"
              title="Remove Skill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[12px] text-[var(--text-tertiary)] font-medium tracking-[0.02em]">Score</span>
            <span className="text-[18px] font-medium text-[var(--text-primary)]">{skill.currentScore.toFixed(0)}<span className="text-[13px] text-[var(--text-tertiary)]">/100</span></span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <div
              className="h-full rounded-full bg-[#2563EB]"
              style={{ width: `${skill.currentScore}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => openBoostModal(skill, isDebt)}
          className="w-full h-9 rounded-[var(--radius-md)] text-[14px] font-medium flex justify-center items-center gap-2 transition-colors border"
          style={{
            borderColor: isDebt ? 'var(--danger)' : 'var(--border-base)',
            color: isDebt ? 'var(--danger)' : 'var(--text-secondary)',
            background: isDebt ? 'var(--danger-bg)' : 'transparent',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isDebt ? 'var(--danger-bg)' : 'var(--bg-raised)'}
          onMouseLeave={(e) => e.currentTarget.style.background = isDebt ? 'var(--danger-bg)' : 'transparent'}
        >
          {isHealthy ? <Activity className="w-4 h-4" /> : isDebt ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          {isHealthy ? "Train skill" : isDebt ? "Resolve debt" : "Boost score"}
        </button>
      </div>
    );
  };

  if (isLoading && healthy.length === 0 && draining.length === 0 && debts.length === 0) {
    return <div className="text-[var(--text-tertiary)] flex justify-center mt-20 animate-pulse-subtle text-[14px]">Loading skills...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">

      {/* Header */}
      <div className="flex justify-between items-end border-b pb-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">Skill Control</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-[14px]">Monitor your competencies, resolve decaying debts, and expand your stack.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[var(--radius-md)] font-medium text-[14px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add skills
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">

        {/* Debts */}
        {debts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Skill debts</h2>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{debts.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {debts.map(skill => <SkillCard key={skill._id} skill={skill} type="debt" />)}
            </div>
          </section>
        )}

        {/* Draining */}
        {draining.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Draining skills</h2>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>{draining.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {draining.map(skill => <SkillCard key={skill._id} skill={skill} type="draining" />)}
            </div>
          </section>
        )}

        {/* Healthy */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Healthy skills</h2>
            <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>{healthy.length}</span>
          </div>
          {healthy.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {healthy.map(skill => <SkillCard key={skill._id} skill={skill} type="healthy" />)}
            </div>
          ) : (
             <div className="p-8 border border-dashed rounded-[var(--radius-lg)] text-center text-[14px] text-[var(--text-tertiary)]" style={{ borderColor: 'var(--border-base)' }}>
                No healthy skills right now. Try adding a new skill or boosting a draining one!
             </div>
          )}
        </section>

      </div>

      {/* Modals */}
      <AddSkillsModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <BoostModal
        isOpen={boostModalData.isOpen}
        onClose={() => setBoostModalData({ isOpen: false, skill: null, isDebt: false })}
        skill={boostModalData.skill}
        isDebt={boostModalData.isDebt}
      />

    </div>
  );
}
