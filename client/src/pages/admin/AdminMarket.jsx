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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Market
            Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Push real-time trending skills directly to the users.
          </p>
        </div>
        <div className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 font-medium rounded-md border border-emerald-100 flex items-center gap-2 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse bypass"></span>
          SSE System Connected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Injection / Update Form */}
        <div className="lg:col-span-1">
          <div
            className={`bg-white rounded-xl border shadow-sm overflow-hidden sticky top-6 transition-all ${
              editMode
                ? "border-amber-300 shadow-amber-500/10"
                : "border-slate-200"
            }`}
          >
            <div
              className={`px-6 py-5 border-b flex justify-between items-center ${
                editMode
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-slate-50/50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Edit3 className="w-5 h-5 text-amber-600" />
                ) : (
                  <Plus className="w-5 h-5 text-indigo-600" />
                )}
                <h3 className="text-base font-semibold text-slate-800">
                  {editMode ? "Update Market Data" : "Inject Market Trend"}
                </h3>
              </div>
              {editMode && (
                <button
                  onClick={cancelEdit}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Skill Name
                  </label>
                  <div className="relative group">
                    <Code2 className="w-4 h-4 text-slate-400 absolute left-3 top-[11px] group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="skillName"
                      value={formData.skillName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      placeholder="e.g. Next.js App Router"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Demand %
                    </label>
                    <div className="relative group">
                      <Activity className="w-4 h-4 text-slate-400 absolute left-3 top-[11px] group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        name="demandPercentage"
                        value={formData.demandPercentage}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="85"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Open Roles
                    </label>
                    <div className="relative group">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-[11px] group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="number"
                        min="0"
                        name="openRoles"
                        value={formData.openRoles}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="1250"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Parent Language{" "}
                    <span className="lowercase text-slate-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="parentLanguage"
                    value={formData.parentLanguage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="e.g. JavaScript, Python"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm ring-1 active:scale-[0.98] ${
                      editMode
                        ? "bg-amber-500 hover:bg-amber-600 ring-amber-600 shadow-amber-500/20 disabled:bg-amber-400"
                        : "bg-indigo-600 hover:bg-indigo-700 ring-indigo-700 shadow-indigo-600/20 disabled:bg-indigo-400"
                    }`}
                  >
                    {isSubmitting
                      ? "Broadcasting..."
                      : editMode
                        ? "Broadcast System Update"
                        : "Broadcast Sub-system Update"}
                  </button>

                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors border border-slate-200 text-sm shadow-sm active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Live Market Stream Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-800">
                Active Market Stream Feed
              </h3>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-h-[700px] bg-slate-50/30">
              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
                  <Activity className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">
                    Awaiting market activity...
                  </p>
                </div>
              ) : (
                skills.map((skill, idx) => (
                  <div
                    key={skill._id || idx}
                    className="group relative bg-white border border-slate-200/80 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 shadow-sm transition-all duration-300 transform origin-top animate-in fade-in slide-in-from-top-4"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold tracking-tight">
                        <TrendingUp className="w-3.5 h-3.5" />{" "}
                        {skill.demandPercentage}% Demand
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shrink-0">
                        <Code2 className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div className="pt-1 flex-1">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {skill.skillName}
                        </h4>
                        {skill.parentLanguage && (
                          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider inline-block mt-0.5">
                            {skill.parentLanguage}
                          </span>
                        )}
                        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-4 w-full">
                          {/* <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">
                                {skill.openRoles.toLocaleString()} open roles
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hidden sm:flex">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Now Trending
                            </div>
                          </div> */}

                          {/* ACTION BUTTONS */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(skill)}
                              className="px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 rounded-md transition-colors shadow-sm"
                              title="Edit Trend"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(skill._id)}
                              className="px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-md transition-colors shadow-sm"
                              title="Delete Trend"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
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
