import { create } from "zustand";
import { getSkillCatalog } from "../services/skillService";
import { toast } from "sonner";

export const useSkillCatalogStore = create((set) => ({
  skills: [],
  isLoading: false,

  fetchCatalog: async () => {
    set({ isLoading: true });
    try {
      const data = await getSkillCatalog();
      set({ skills: data.skills || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to load skill presets");
    }
  },
}));
