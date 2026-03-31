import { Question } from "../../models/Question.js";
import { TestHistory } from "../../models/TestHistory.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { redisConnection } from "../../config/redis.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Skill } from "../../models/Skill.js";
import { User } from "../../models/User.js";

// -- Generate the Test and create active section --
export const generateTest = async (
  userId: string,
  skillName: StringConstructor,
  expectedLevel: string,
) => {
  // Check existing session(test)
  const existingSession = await redisConnection.get(`test_session:${userId}`);

  if (existingSession) {
    throw new AppError(
      "You already have an active test session! Please finish it.",
      429,
    );
  }

  // Find questions seen in the last 4 weeks
  const fourWeeksAgo = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000);

  const recentHistories = await TestHistory.find({
    userId,
    skillName,
    createdAt: { $gte: fourWeeksAgo },
  });

  // Seen Ids
  const seenIds = recentHistories.flatMap((history) => history.questionIds);

  // Fetch 5 random MCQs (nin 4w)
  const mcqs = await Question.aggregate([
    {
      $match: { skill: skillName, type: "mcq", questionId: { $nin: seenIds } },
    },
    {
      $sample: { size: 5 },
    },
    {
      $project: { _id: 1, questionId: 1, question: 1, options: 1, level: 1 },
    },
  ]);

  // Out of mcqs
  if (mcqs.length < 5) {
    throw new AppError("Not enough unique MCQ questions available.", 400);
  }

  // Find 1 random compiler question (nin 4w)
  const codeDbs = await Question.aggregate([
    {
      $match: { skill: skillName, type: "code", questionId: { $nin: seenIds } },
    },
    { $sample: { size: 1 } },
  ]);

  // Out of codeDbs
  if (codeDbs.length < 1) {
    throw new AppError("Not enough unique code questions available.", 400);
  }

  const codeTest = codeDbs[0];

  // -- Redis test caching --
  const sessionData = {
    skillName,
    mcqIds: mcqs.map((q) => q.questionId),
    codeId: codeTest.questionId,
    startTime: Date.now(),
  };

  await redisConnection.set(
    `test_session:${userId}`,
    JSON.stringify(sessionData),
    "EX",
    600,
  );

  return { mcqs, codeTest };
};

// -- Piston Compiler service --

const PISTON_LANGUAGE_MAP: Record<
  string,
  { language: string; version: string }
> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  // add whatever piston supports
};

// -- Score the code via Piston --
export const executeCodeTest = async (
  userCode: string,
  testCases: any[],
  validationScript: string,
  language: string,
) => {
  const runtime =
    PISTON_LANGUAGE_MAP[language.toLowerCase()] ||
    PISTON_LANGUAGE_MAP["javascript"];

  let passedCases = 0;

  // Test the code against each test case silently
  for (const tc of testCases) {
    const executableCode = `${userCode}\n\n${validationScript.replace("{{input}}", tc.input)}`;
    try {
      const { data } = await axios.post("https://emacsx.com/api/v2/execute", {
        language: runtime?.language,
        version: runtime?.version,
        files: [{ content: executableCode }],
      });
      // Piston puts the terminal output in data.run.stdout
      const output = data.run.stdout ? data.run.stdout.trim() : "";

      // Strict matching
      if (output === tc.output.trim()) {
        passedCases++;
      }
    } catch (error) {
      console.error("Piston API failed", error);
    }
  }
  // Calculate score chunk
  const percentagePassed = passedCases / testCases.length; // e.g., 4/5 = 80%
  const compilerScore = percentagePassed * 50; // out of 50 points
  return { compilerScore, passedCases, totalCases: testCases.length };
};

// -- Gemini Audit --
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const auditCodeWithGemini = async (
  userCode: string,
  problemStatement: string,
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }, // Force JSON return!
  });

  // Gemini prompt
  const prompt = `
    You are a Senior Software Engineer doing a strict code review.
    Problem: ${problemStatement}
    User Code:
    ${userCode}
    
    Task: Evaluate ONLY the code quality, time/space complexity, and modern standard practices.
    Return a strict JSON object with EXACTLY this structure:
    {
      "aiScore": number, // an integer from 0 to 10
      "feedback": string // 1-2 sentences of actionable advice
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      aiScore: typeof parsed.aiScore === "number" ? parsed.aiScore : 5,
      feedback: parsed.feedback || "Good attempt.",
    };
  } catch (error) {
    console.error("Gemini AI failed", error);
    return {
      aiScore: 5,
      feedback: "AI Audit unavailable, default score given.",
    };
  }
};

// -- Submit and Validate test --
export const gradeVerificationTest = async (
  userId: string,
  skillName: string,
  mcqAnswers: { questionId: string; answerIndex: number }[],
  codeAnswer: string,
  codeQuestionId: string,
) => {
  // Retrieve back the redis cached questions
  const sessionString = await redisConnection.get(`test_session:${userId}`);

  if (!sessionString) {
    throw new AppError(
      "Test session expired! You took longer than 20 minutes.",
      400,
    );
  }

  const activeSession = JSON.parse(sessionString);

  // Ban the test - manipulated question
  if (activeSession.codeId !== codeQuestionId) {
    await redisConnection.del(`test_session:${userId}`);
    throw new AppError(
      "Invalid test submission detected. Session invalidated.",
      403,
    );
  }

  for (const mcq of mcqAnswers) {
    if (!activeSession.mcqIds.includes(mcq.questionId)) {
      await redisConnection.del(`test_session:${userId}`);
      throw new AppError(
        "Invalid MCQ submission detected. Session invalidated.",
        403,
      );
    }
  }

  // Grade MCQs (40)
  let correctMcqs = 0;

  // compare with db options
  for (const answerSet of mcqAnswers) {
    const dbQuestion = await Question.findOne({
      questionId: answerSet.questionId,
    });
    if (dbQuestion && dbQuestion.correctAnswerIndex === answerSet.answerIndex) {
      correctMcqs++;
    }
  }

  const mcqScore = (correctMcqs / 5) * 40;

  // Grade code (50)
  const dbCodeQ = await Question.findOne({ questionId: codeQuestionId });

  const { compilerScore, passedCases } = await executeCodeTest(
    codeAnswer,
    dbCodeQ!.testCases!,
    dbCodeQ!.validationScript!,
    skillName,
  );

  // Gemini Audit (10)
  const { aiScore, feedback } = await auditCodeWithGemini(
    codeAnswer,
    dbCodeQ!.problemStatement!,
  );

  // Final calculation (MCQ + Code + AI audit)
  const totalScore = mcqScore + compilerScore + aiScore;
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Update the Skill baseline score
  const skillRecord = await Skill.findOne({ userId, name: skillName });

  if (skillRecord) {
    skillRecord.baselineScore = Math.floor(finalScore);
    skillRecord.currentScore = Math.floor(finalScore);
    await skillRecord.save();
  }

  // Log the Test History to prevent repetition (4w)
  const allQuestionIds = mcqAnswers
    .map((m) => m.questionId)
    .concat(codeQuestionId);

  await TestHistory.create({
    userId,
    skillName,
    questionIds: allQuestionIds,
  });

  // update user onboarding status
  await User.findByIdAndUpdate(userId, { onboardingStatus: "completed" });

  // delete session after test
  await redisConnection.del(`test_session:${userId}`);

  return {
    breakdown: {
      mcqPoints: mcqScore,
      compilerPoints: compilerScore,
      aiPoints: aiScore,
    },
    finalScore: Math.floor(finalScore),
    feedback,
  };
};
