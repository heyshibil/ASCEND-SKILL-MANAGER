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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0b0b0f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-semibold text-white">Add New Skills</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {skillsList.map((skill, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl relative group">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Skill Name</label>
                {skillsList.length > 1 && (
                  <button onClick={() => handleRemoveRow(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                value={skill.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                className="bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Confidence Level</span>
                  <span className="text-indigo-400 font-bold">{skill.confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.confidence}
                  onChange={(e) => handleChange(i, "confidence", Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Another Skill
          </button>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02]">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {loading ? "Adding..." : "Save Skills"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
