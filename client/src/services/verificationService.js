import { API } from "./api";

export const verificationService = {
  startTest: async (skillName, level) => {
    const { data } = await API.post("/verification/start", {
      skillName,
      level,
    });

    return data;
  },

  submitTest: async (skillName, mcqAnswers, codeAnswer, codeQuestionId) => {
    const { data } = await API.post("/verification/submit", {
      skillName,
      mcqAnswers,
      codeAnswer,
      codeQuestionId,
    });

    return data;
  },
};
