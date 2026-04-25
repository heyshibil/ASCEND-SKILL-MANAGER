import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as skillService from "../services/skillService";
import { toast } from "sonner";

export const useSkillStore = create(
  devtools((set, get) => ({
    healthy: [],
    draining: [],
    debts: [],
    isLoading: false,

    fetchSkills: async () => {
      set({ isLoading: true });

      try {
        const data = await skillService.getCategorizedSkills();
        set({
          healthy: data.categorizedSkills.healthy || [],
          draining: data.categorizedSkills.draining || [],
          debts: data.categorizedSkills.debts || [],
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        toast.error("Failed to fetch skills");
      }
    },

    addSkills: async (skills) => {
      try {
        await skillService.addSkills(skills);
        await get().fetchSkills();
        toast.success("Skills added successfully");
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add skills");
        return false;
      }
    },

    deleteSkill: async (skillId) => {
      try {
        await skillService.deleteSkill(skillId);
        await get().fetchSkills();
        toast.success("Skill removed successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete skill");
      }
    },

    boostSkillFast: async (skillName, level) => {
      try {
        await skillService.boostSkill(skillName, level);
        await get().fetchSkills();
        toast.success(`${skillName} boosted via MCQ!`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to boost skill");
      }
    },
}), {name: "SkillStore"}),
);
