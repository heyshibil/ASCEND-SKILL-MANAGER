import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Plus,
  Code2,
  Users,
  Briefcase,
  Activity,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useMarketStore } from "../../store/useMarketStore";
import { adminService } from "../../services/adminServices";

export default function AdminMarket() {
  const { skills, initializeMarketStream, closeMarketStream } =
    useMarketStore();

  const [formData, setFormData] = useState({
    skillName: "",
    demandPercentage: "",
    parentLanguage: "",
    openRoles: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSkillId, setEditSkillId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  // 1. Mount SSE Listener
  useEffect(() => {
    initializeMarketStream();

    return () => {
      closeMarketStream();
    };
  }, [initializeMarketStream, closeMarketStream]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditSkillId(null);
    setFormData({
      skillName: "",
      demandPercentage: "",
      parentLanguage: "",
      openRoles: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode && editSkillId) {
        await adminService.updateMarketSkill(editSkillId, formData);
        toast.success("Skill updated successfully!");
      } else {
        await adminService.createMarketSkill(formData)
      }

      // Cleanup states after
      cancelEdit();
    } catch (error) {
      toast.error(
        editMode ? "Failed to update skill." : "Failed to inject market trend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (skill) => {
    setEditMode(true);
    setEditSkillId(skill._id);
    setFormData({
      skillName: skill.skillName,
      demandPercentage: skill.demandPercentage,
      parentLanguage: skill.parentLanguage || "",
      openRoles: skill.openRoles,
    });
    // Quick UX scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id) => {
    setSkillToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;
    try {
      await adminService.deleteMarketSkill(skillToDelete)
      toast.success("Skill deleted");
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleteModalOpen(false);
      setSkillToDelete(null);
    }
  };

  const inputClass = "w-full border rounded-[var(--radius-md)] px-3 h-9 text-[14px] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]";

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" /> Market intelligence
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Push real-time trending skills directly to the users.
          </p>
        </div>
        <div className="text-[13px] px-3 py-1.5 rounded-[var(--radius-md)] font-medium flex items-center gap-2" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
          SSE system connected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-1">
          <div
            className="rounded-[var(--radius-lg)] border overflow-hidden sticky top-6 transition-all"
            style={{
              background: 'var(--bg-surface)',
              borderColor: editMode ? 'var(--warning)' : 'var(--border-subtle)',
            }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Edit3 className="w-4 h-4 text-[var(--warning)]" />
                ) : (
                  <Plus className="w-4 h-4 text-[var(--accent)]" />
                )}
                <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                  {editMode ? "Update market data" : "Inject market trend"}
                </h3>
              </div>
              {editMode && (
                <button
                  onClick={cancelEdit}
                  className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                    Skill name
                  </label>
                  <div className="relative group">
                    <Code2 className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-[10px] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input
                      type="text"
                      name="skillName"
                      value={formData.skillName}
                      onChange={handleInputChange}
                      required
                      className={inputClass + " pl-10"}
                      style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                      placeholder="e.g. Next.js App Router"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                      Demand %
                    </label>
                    <div className="relative group">
                      <Activity className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-[10px] group-focus-within:text-[var(--accent)] transition-colors" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        name="demandPercentage"
                        value={formData.demandPercentage}
                        onChange={handleInputChange}
                        required
                        className={inputClass + " pl-10"}
                        style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                        placeholder="85"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                      Open roles
                    </label>
                    <div className="relative group">
                      <Briefcase className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-[10px] group-focus-within:text-[var(--accent)] transition-colors" />
                      <input
                        type="number"
                        min="0"
                        name="openRoles"
                        value={formData.openRoles}
                        onChange={handleInputChange}
                        required
                        className={inputClass + " pl-10"}
                        style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                        placeholder="1250"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                    Parent language <span className="text-[var(--text-disabled)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="parentLanguage"
                    value={formData.parentLanguage}
                    onChange={handleInputChange}
                    className={inputClass}
                    style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                    placeholder="e.g. JavaScript, Python"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className={`w-full text-white font-medium h-9 rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 text-[14px] ${
                      editMode
                        ? "bg-[var(--warning)] hover:opacity-90"
                        : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                    } disabled:opacity-50`}
                  >
                    {isSubmitting
                      ? "Broadcasting..."
                      : editMode
                        ? "Broadcast system update"
                        : "Broadcast sub-system update"}
                  </button>

                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-full h-9 border rounded-[var(--radius-md)] text-[var(--text-secondary)] text-[14px] font-medium transition-colors hover:bg-[var(--bg-raised)]"
                      style={{ borderColor: 'var(--border-base)' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Live Market Stream */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border overflow-hidden flex flex-col h-full min-h-[500px]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
              <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                Active market stream feed
              </h3>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-h-[700px]">
              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] mt-20">
                  <Activity className="w-10 h-10 mb-3" />
                  <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                    Awaiting market activity...
                  </p>
                </div>
              ) : (
                skills.map((skill, idx) => (
                  <div
                    key={skill._id || idx}
                    className="group relative rounded-[var(--radius-lg)] border p-5 transition-all hover:bg-[var(--bg-raised)]"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        {skill.demandPercentage}% Demand
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0" style={{ background: 'var(--bg-raised)' }}>
                        <Code2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <div className="pt-1 flex-1">
                        <h4 className="text-[16px] font-medium text-[var(--text-primary)]">
                          {skill.skillName}
                        </h4>
                        {skill.parentLanguage && (
                          <span className="text-[11px] font-medium text-[var(--accent)] tracking-[0.02em] inline-block mt-0.5">
                            {skill.parentLanguage}
                          </span>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(skill)}
                            className="px-2 py-1 flex items-center gap-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] border transition-colors text-[var(--text-secondary)] hover:text-[var(--warning)] hover:bg-[var(--warning-bg)]"
                            style={{ borderColor: 'var(--border-base)' }}
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(skill._id)}
                            className="px-2 py-1 flex items-center gap-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] border transition-colors text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                            style={{ borderColor: 'var(--border-base)' }}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSkillToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Market Trend?"
        message="Are you sure you want to delete this trending skill? This action cannot be undone."
      />
    </div>
  );
}
