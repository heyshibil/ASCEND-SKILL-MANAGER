import { API } from "./api";

export const initSkills = async (payload) => {
  const { data } = await API.post("/skills/init", payload);
  return data;
};

export const getSkillCatalog = async () => {
  const { data } = await API.get("/skills/catalog");
  return data;
};

export const addSkills = async (skills) => {
  const { data } = await API.post("/skills/add", { skills });
  return data;
};

export const deleteSkill = async (skillId) => {
  const { data } = await API.delete(`/skills/${skillId}`);
  return data;
};

export const getCategorizedSkills = async () => {
  const { data } = await API.get("/skills/categorized");
  return data;
};

export const boostSkill = async (skillName, level) => {
  const { data } = await API.post("/skills/boost", { skillName, level });
  return data;
};
