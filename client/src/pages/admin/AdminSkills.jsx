import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Edit3,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/adminServices";
import { CustomSelect } from "../../components/ui/CustomSelect";
import ConfirmModal from "../../components/ui/ConfirmModal";

const CATEGORY_OPTIONS = [
  { value: "Foundational", label: "Foundational" },
  { value: "Language", label: "Language" },
  { value: "Framework", label: "Framework" },
  { value: "Tooling", label: "Tooling" },
];

const emptyForm = {
  name: "",
  category: "Framework",
  stabilityConstant: 70,
  dependsOn: [],
  isActive: true,
};

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editSkillId, setEditSkillId] = useState(null);
  const [deleteSkill, setDeleteSkill] = useState(null);

  const editMode = Boolean(editSkillId);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSkillPresets({ search });
      setSkills(data.skills || []);
    } catch (error) {
      toast.error("Failed to load skill presets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const dependencyOptions = useMemo(
    () => skills.filter((skill) => skill._id !== editSkillId),
    [editSkillId, skills],
  );

  const resetForm = () => {
    setEditSkillId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        stabilityConstant: Number(formData.stabilityConstant),
      };

      if (editMode) {
        await adminService.updateSkillPreset(editSkillId, payload);
        toast.success("Skill preset updated");
      } else {
        await adminService.createSkillPreset(payload);
        toast.success("Skill preset added");
      }

      resetForm();
      await fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save skill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (skill) => {
    setEditSkillId(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      stabilityConstant: skill.stabilityConstant,
      dependsOn: (skill.dependsOn || []).map((dependency) =>
        typeof dependency === "string" ? dependency : dependency._id,
      ),
      isActive: skill.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDependency = (skillId) => {
    setFormData((current) => ({
      ...current,
      dependsOn: current.dependsOn.includes(skillId)
        ? current.dependsOn.filter((id) => id !== skillId)
        : [...current.dependsOn, skillId],
    }));
  };

  const confirmDelete = async () => {
    if (!deleteSkill) return;

    try {
      await adminService.deleteSkillPreset(deleteSkill._id);
      toast.success("Skill preset deleted");
      await fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete skill");
    } finally {
      setDeleteSkill(null);
    }
  };

  const inputClass =
    "w-full border rounded-[var(--radius-md)] px-3 h-9 text-[14px] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]";

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--accent)]" /> Skill presets
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Manage the approved skills users can select across Ascend.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchSkills();
            }}
            className="pl-9 pr-4 h-10 w-[300px] bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-[var(--radius-md)] text-[14px] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div
            className="rounded-[var(--radius-lg)] border overflow-hidden sticky top-6"
            style={{
              background: "var(--bg-surface)",
              borderColor: editMode ? "var(--warning)" : "var(--border-subtle)",
            }}
          >
            <div
              className="px-6 py-4 border-b flex justify-between items-center"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-raised)",
              }}
            >
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Edit3 className="w-4 h-4 text-[var(--warning)]" />
                ) : (
                  <Plus className="w-4 h-4 text-[var(--accent)]" />
                )}
                <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                  {editMode ? "Update preset" : "Add preset"}
                </h3>
              </div>
              {editMode && (
                <button
                  onClick={resetForm}
                  className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                  Skill name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Next.js"
                  className={inputClass}
                  style={{
                    background: "var(--bg-raised)",
                    borderColor: "var(--border-base)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Category"
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  options={CATEGORY_OPTIONS}
                />

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-2">
                    Stability
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.stabilityConstant}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stabilityConstant: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                    style={{
                      background: "var(--bg-raised)",
                      borderColor: "var(--border-base)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="accent-[var(--accent)]"
                />
                Available for users
              </label>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <label className="text-[11px] font-medium text-[var(--text-tertiary)] tracking-[0.02em]">
                    Depends on
                  </label>
                </div>
                <div
                  className="max-h-40 overflow-y-auto rounded-[var(--radius-md)] border p-2 flex flex-col gap-1"
                  style={{
                    borderColor: "var(--border-base)",
                    background: "var(--bg-raised)",
                  }}
                >
                  {dependencyOptions.length === 0 ? (
                    <p className="text-[13px] text-[var(--text-tertiary)] px-2 py-1">
                      No other presets yet.
                    </p>
                  ) : (
                    dependencyOptions.map((skill) => (
                      <label
                        key={skill._id}
                        className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          {skill.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.dependsOn.includes(skill._id)}
                          onChange={() => toggleDependency(skill._id)}
                          className="accent-[var(--accent)]"
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className={`w-full text-white font-medium h-9 rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2 text-[14px] ${
                  editMode
                    ? "bg-[var(--warning)] hover:opacity-90"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                } disabled:opacity-50`}
              >
                {submitting
                  ? "Saving..."
                  : editMode
                    ? "Update preset"
                    : "Add preset"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            className="rounded-[var(--radius-lg)] border overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Stability
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Dependencies
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-16 text-center text-[var(--text-tertiary)]"
                    >
                      Loading skill presets...
                    </td>
                  </tr>
                ) : skills.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-16 text-center text-[var(--text-tertiary)]"
                    >
                      No skill presets found.
                    </td>
                  </tr>
                ) : (
                  skills.map((skill) => (
                    <tr
                      key={skill._id}
                      className="hover:bg-[var(--bg-raised)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
                            style={{ background: "var(--bg-raised)" }}
                          >
                            <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[var(--text-primary)]">
                              {skill.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[12px] text-[var(--text-tertiary)]">
                                {skill.category}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium"
                                style={{
                                  background: skill.isActive
                                    ? "var(--success-bg)"
                                    : "var(--bg-raised)",
                                  color: skill.isActive
                                    ? "var(--success)"
                                    : "var(--text-tertiary)",
                                }}
                              >
                                {skill.isActive ? "Active" : "Hidden"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)] font-[var(--font-mono)]">
                        {skill.stabilityConstant}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                          {(skill.dependsOn || []).length === 0 ? (
                            <span className="text-[13px] text-[var(--text-tertiary)]">
                              None
                            </span>
                          ) : (
                            skill.dependsOn.map((dependency) => (
                              <span
                                key={dependency._id || dependency}
                                className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[12px] font-medium"
                                style={{
                                  background: "var(--accent-bg)",
                                  color: "var(--accent)",
                                }}
                              >
                                {dependency.name || "Skill"}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="px-2 py-1 flex items-center gap-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] border transition-colors text-[var(--text-secondary)] hover:text-[var(--warning)] hover:bg-[var(--warning-bg)]"
                            style={{ borderColor: "var(--border-base)" }}
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteSkill(skill)}
                            className="px-2 py-1 flex items-center gap-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] border transition-colors text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                            style={{ borderColor: "var(--border-base)" }}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteSkill)}
        onClose={() => setDeleteSkill(null)}
        onConfirm={confirmDelete}
        title="Delete Skill Preset?"
        message="Users will no longer be able to select this skill from the catalog."
        confirmText="Delete"
      />
    </div>
  );
}
