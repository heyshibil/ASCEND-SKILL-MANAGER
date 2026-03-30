import { API } from "./api";

export const initSkills = async (selectedSkills) => {
  const { data } = await API.post("/skills/init", { skills: selectedSkills });
  return data;
};
