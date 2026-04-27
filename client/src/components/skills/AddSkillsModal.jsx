import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useSkillStore } from "../../store/useSkillStore";

export default function AddSkillsModal({ isOpen, onClose }) {
  const addSkills = useSkillStore((state) => state.addSkills);
  const [skillsList, setSkillsList] = useState([{ name: "", confidence: 50 }]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setSkillsList([...skillsList, { name: "", confidence: 50 }]);
  };

  const handleRemoveRow = (index) => {
    const newList = [...skillsList];
    newList.splice(index, 1);
    setSkillsList(newList);
  };

  const handleChange = (index, field, value) => {
    const newList = [...skillsList];
    newList[index][field] = value;
    setSkillsList(newList);
  };

  const handleSubmit = async () => {
    const validSkills = skillsList.filter((s) => s.name.trim() !== "");
    if (validSkills.length === 0) return;

    setLoading(true);
    const success = await addSkills(validSkills);
    setLoading(false);

    if (success) {
      setSkillsList([{ name: "", confidence: 50 }]);
      onClose();
    }
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
            <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Add new skills</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Add skills and set your confidence level</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {skillsList.map((skill, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-[var(--radius-lg)] relative group" style={{ background: 'var(--bg-raised)' }}>
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Skill name</label>
                {skillsList.length > 1 && (
                  <button onClick={() => handleRemoveRow(i)} className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                value={skill.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                className="h-9 border rounded-[var(--radius-md)] px-3 text-[14px] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
              />
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[var(--text-secondary)]">Confidence level</span>
                  <span className="text-[var(--accent)] font-medium">{skill.confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.confidence}
                  onChange={(e) => handleChange(i, "confidence", Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="flex items-center justify-center gap-2 h-10 border border-dashed rounded-[var(--radius-lg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-all text-[14px]"
            style={{ borderColor: 'var(--border-base)' }}
          >
            <Plus className="w-4 h-4" /> Add another skill
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="px-4 h-9 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] transition-colors text-[14px] font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 h-9 rounded-[var(--radius-md)] bg-[#2563EB] text-white text-[14px] font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Save skills"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
