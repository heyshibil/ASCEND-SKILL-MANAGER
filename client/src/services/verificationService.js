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

  // Boost APIs
  generateBoostTest: async (skillName, type, level) => {
    const { data } = await API.get("/verification/boost/generate", {
      params: { skillName, type, level },
    });

    return data;
  },

  submitMcqBoost: async (skillName, answers) => {
    const { data } = await API.post("/verification/boost/mcq/submit", {
      skillName,
      answers,
    });

    return data;
  },

  submitCompilerBoost: async (skillName, codeAnswer, questionId) => {
    const { data } = await API.post("/verification/boost/compiler/submit", {
      skillName,
      codeAnswer,
      questionId,
    });

    return data;
  },
};
