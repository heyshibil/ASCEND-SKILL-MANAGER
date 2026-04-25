import { API } from "./api";

export const initSkills = async (selectedSkills) => {
  const { data } = await API.post("/skills/init", { skills: selectedSkills });
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
