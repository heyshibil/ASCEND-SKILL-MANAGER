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
    
    // Style configurations based on skill status
    const cardBorder = isDebt ? "border-red-500/20" : isHealthy ? "border-emerald-500/20" : "border-amber-500/20";
    const bgGlow = isDebt ? "hover:bg-red-500/[0.02]" : isHealthy ? "hover:bg-emerald-500/[0.02]" : "hover:bg-amber-500/[0.02]";
    const scoreColor = isDebt ? "text-red-400" : isHealthy ? "text-emerald-400" : "text-amber-400";

    return (
      <div className={`p-5 rounded-2xl bg-white/[0.02] border border-white/5 ${cardBorder} ${bgGlow} transition-all flex flex-col justify-between group`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-xl shadow-inner">
              {getIconForSkill(skill.name)}
            </div>
            <div>
              <h3 className="text-white font-medium">{skill.name}</h3>
              <p className="text-xs text-slate-500">{skill.category}</p>
            </div>
          </div>
          <button 
            onClick={() => handleDelete(skill._id, skill.name)}
            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Skill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Score</span>
            <span className={`text-xl font-bold ${scoreColor}`}>{skill.currentScore.toFixed(0)}<span className="text-sm text-slate-500">/100</span></span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isDebt ? "bg-red-500" : isHealthy ? "bg-emerald-500" : "bg-amber-500"}`} 
              style={{ width: `${skill.currentScore}%` }}
            />
          </div>
        </div>

        <button 
          onClick={() => openBoostModal(skill, isDebt)}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex justify-center items-center gap-2 transition-all cursor-pointer
            ${isDebt ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : 
            isHealthy ? "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10" : 
            "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"}
          `}
        >
          {isHealthy ? <Activity className="w-4 h-4" /> : isDebt ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          {isHealthy ? "Train Skill" : isDebt ? "Resolve Debt" : "Boost Score"}
        </button>
      </div>
    );
  };

  if (isLoading && healthy.length === 0 && draining.length === 0 && debts.length === 0) {
    return <div className="text-slate-400 flex justify-center mt-20 animate-pulse">Loading skills...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Skill Control</h1>
          <p className="text-slate-400 mt-2 text-sm">Monitor your competencies, resolve decaying debts, and expand your stack.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Add Skills
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-12">
        
        {/* Debts */}
        {debts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
              <h2 className="text-xl font-semibold text-white">Skill Debts</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">{debts.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {debts.map(skill => <SkillCard key={skill._id} skill={skill} type="debt" />)}
            </div>
          </section>
        )}

        {/* Draining */}
        {draining.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Zap className="w-5 h-5" /></div>
              <h2 className="text-xl font-semibold text-white">Draining Skills</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{draining.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {draining.map(skill => <SkillCard key={skill._id} skill={skill} type="draining" />)}
            </div>
          </section>
        )}

        {/* Healthy */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h2 className="text-xl font-semibold text-white">Healthy Skills</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">{healthy.length}</span>
          </div>
          {healthy.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthy.map(skill => <SkillCard key={skill._id} skill={skill} type="healthy" />)}
            </div>
          ) : (
             <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-slate-500">
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
