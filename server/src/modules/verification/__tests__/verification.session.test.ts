import { jest, test, expect, describe, afterEach } from "@jest/globals";

// ──────────────────────────────────────────────────────────────────────────────
// verification.session.test.ts
//
// Tests the anti-cheat session validation and MCQ scoring logic in
// gradeVerificationTest and gradeMcqBoost.
//
// All external I/O is mocked — no real Redis, DB, Lambda, or AI calls.
// ──────────────────────────────────────────────────────────────────────────────

// --- Mock Redis ---
const mockRedisGet = jest.fn();
const mockRedisDel = jest.fn().mockResolvedValue(1 as never);
const mockRedisSet = jest.fn().mockResolvedValue("OK" as never);

jest.unstable_mockModule("../../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: mockRedisGet,
    set: mockRedisSet,
    del: mockRedisDel,
  },
}));

// --- Mock TestHistory model ---
jest.unstable_mockModule("../../../models/TestHistory.js", () => ({
  TestHistory: {
    find: jest.fn().mockResolvedValue([] as never),
    create: jest.fn().mockResolvedValue({} as never),
  },
}));

// --- Mock Skill model ---
const mockSkillFindOne = jest.fn();
jest.unstable_mockModule("../../../models/Skill.js", () => ({
  Skill: {
    find: jest.fn().mockResolvedValue([] as never),
    findOne: mockSkillFindOne,
  },
}));

// --- Mock User model ---
jest.unstable_mockModule("../../../models/User.js", () => ({
  User: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue({} as never),
  },
}));

// --- Mock user.service — refreshLiquidityScore pulls in its own chain of deps ---
jest.unstable_mockModule("../../users/user.service.js", () => ({
  refreshLiquidityScore: jest.fn().mockResolvedValue(75 as never),
}));

// --- Mock compiler.service — no real Lambda calls ---
const mockExecuteCodeTest = jest.fn();
jest.unstable_mockModule("../compiler.service.js", () => ({
  executeCodeTest: mockExecuteCodeTest,
  runCodeTest: jest.fn(),
}));

// --- Mock questions.repository ---
const mockFindManyForGrading = jest.fn();
const mockFindVerifiedCode = jest.fn();
jest.unstable_mockModule("../../questions/questions.repository.js", () => ({
  findManyQuestionsForGrading: mockFindManyForGrading,
  findVerifiedCodeQuestion: mockFindVerifiedCode,
  findByQuestionId: jest.fn(),
  findRandomQuestions: jest.fn(),
  findManyByQuestionIds: jest.fn(),
}));

// --- Mock cache utilities ---
jest.unstable_mockModule("../../../utils/cache.js", () => ({
  withCache: jest.fn(),
  invalidateCache: jest.fn().mockResolvedValue(undefined as never),
}));

// --- Mock Google Generative AI — used at module level in verification.service ---
jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(
            JSON.stringify({ aiScore: 7, feedback: "Good code quality." }),
          ),
        },
      } as never),
    }),
  })),
}));

// --- Dynamic imports after ALL mocks are declared ---
const { gradeVerificationTest, gradeMcqBoost } = await import(
  "../verification.service.js"
);

// ─── Shared test data ─────────────────────────────────────────────────────────
const TEST_USER_ID = "user-123";
const TEST_SKILL = "javascript";

const MCQ_IDS = [
  "MCQ-JS-BEG-001",
  "MCQ-JS-BEG-002",
  "MCQ-JS-BEG-003",
  "MCQ-JS-BEG-004",
  "MCQ-JS-BEG-005",
];
const CODE_ID = "CODE-JS-BEG-001";

const validSession = {
  skillName: TEST_SKILL,
  level: "beginner",
  mcqIds: MCQ_IDS,
  codeId: CODE_ID,
  startTime: Date.now(),
};

// ─── gradeVerificationTest ────────────────────────────────────────────────────
describe("gradeVerificationTest", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockRedisDel.mockResolvedValue(1 as never);
  });

  // --- Expired session: no session key in Redis ---
  // After 10 minutes, the session TTL expires. Submission must be rejected.
  test("should throw 400 when the test session has expired", async () => {
    mockRedisGet.mockResolvedValueOnce(null as never); // session not found

    await expect(
      gradeVerificationTest(
        TEST_USER_ID,
        TEST_SKILL,
        MCQ_IDS.map((id, i) => ({ questionId: id, answerIndex: i % 4 })),
        "function solve(n) { return n; }",
        CODE_ID,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("expired"),
    });
  });

  // --- Tampered codeQuestionId: user swapped the code question for an easier one ---
  // This is the primary anti-cheat check. Session must be destroyed on detect.
  test("should throw 403 and delete session when codeQuestionId is tampered", async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(validSession) as never);

    await expect(
      gradeVerificationTest(
        TEST_USER_ID,
        TEST_SKILL,
        MCQ_IDS.map((id) => ({ questionId: id, answerIndex: 0 })),
        "function solve(n) { return n; }",
        "CODE-JS-BEG-DIFFERENT", // ← not the code question from the session
      ),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("Invalid test submission"),
    });

    // Session must be deleted to prevent reuse after tamper detection
    expect(mockRedisDel).toHaveBeenCalledWith(`test_session:${TEST_USER_ID}`);
  });

  // --- Tampered MCQ ID: user injected a question not assigned to them ---
  test("should throw 403 and delete session when an MCQ questionId is not from the session", async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(validSession) as never);

    const tamperedAnswers = [
      ...MCQ_IDS.slice(0, 4).map((id) => ({ questionId: id, answerIndex: 0 })),
      { questionId: "MCQ-JS-BEG-INJECTED", answerIndex: 0 }, // ← not in session
    ];

    await expect(
      gradeVerificationTest(
        TEST_USER_ID,
        TEST_SKILL,
        tamperedAnswers,
        "function solve(n) { return n; }",
        CODE_ID,
      ),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("Invalid MCQ submission"),
    });

    expect(mockRedisDel).toHaveBeenCalledWith(`test_session:${TEST_USER_ID}`);
  });

  // --- Correct MCQ scoring: 3/5 correct = 24 points ---
  test("should correctly calculate MCQ score (3 correct out of 5 = 24 points)", async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(validSession) as never);

    // DB returns questions with known correct answers
    mockFindManyForGrading.mockResolvedValueOnce([
      { questionId: "MCQ-JS-BEG-001", correctAnswerIndex: 0, question: "Q1", options: ["A","B","C","D"] },
      { questionId: "MCQ-JS-BEG-002", correctAnswerIndex: 1, question: "Q2", options: ["A","B","C","D"] },
      { questionId: "MCQ-JS-BEG-003", correctAnswerIndex: 2, question: "Q3", options: ["A","B","C","D"] },
      { questionId: "MCQ-JS-BEG-004", correctAnswerIndex: 1, question: "Q4", options: ["A","B","C","D"] },
      { questionId: "MCQ-JS-BEG-005", correctAnswerIndex: 2, question: "Q5", options: ["A","B","C","D"] },
    ] as never);

    // User answers: first 3 correct, last 2 wrong
    const mcqAnswers = [
      { questionId: "MCQ-JS-BEG-001", answerIndex: 0 }, // ✓
      { questionId: "MCQ-JS-BEG-002", answerIndex: 1 }, // ✓
      { questionId: "MCQ-JS-BEG-003", answerIndex: 2 }, // ✓
      { questionId: "MCQ-JS-BEG-004", answerIndex: 0 }, // ✗ (correct is 1)
      { questionId: "MCQ-JS-BEG-005", answerIndex: 0 }, // ✗ (correct is 2)
    ];

    // Code test: passes all cases
    mockFindVerifiedCode.mockResolvedValueOnce({
      question: "Write a sum function",
      skill: "javascript",
      validationScript: "",
      testCases: [
        { input: "sum(1,2)", expectedOutput: "3" },
        { input: "sum(0,0)", expectedOutput: "0" },
      ],
    } as never);

    mockExecuteCodeTest.mockResolvedValueOnce({
      compilerScore: 50,
      passedCases: 2,
      totalCases: 2,
    } as never);

    // Skill record for updating baseline
    mockSkillFindOne.mockResolvedValueOnce({
      baselineScore: 0,
      currentScore: 0,
      lastVerifiedDate: null,
      save: jest.fn().mockResolvedValue(undefined as never),
    } as never);

    const result = await gradeVerificationTest(
      TEST_USER_ID,
      TEST_SKILL,
      mcqAnswers,
      "function sum(a,b) { return a+b; }",
      CODE_ID,
    );

    // MCQ: 3/5 * 40 = 24 points
    expect(result.breakdown.mcqPoints).toBe(24);
    // Compiler: mocked at 50
    expect(result.breakdown.compilerPoints).toBe(50);
    // AI: mocked at 7 (from Google AI mock)
    expect(result.breakdown.aiPoints).toBe(7);
    // Total: 24 + 50 + 7 = 81
    expect(result.finalScore).toBe(81);
  });
});

// ─── gradeMcqBoost ────────────────────────────────────────────────────────────
describe("gradeMcqBoost", () => {
  const boostSession = {
    skillName: TEST_SKILL,
    type: "mcq",
    mcqIds: MCQ_IDS,
    codeId: null,
    startTime: Date.now(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    mockRedisDel.mockResolvedValue(1 as never);
  });

  // --- Expired boost session ---
  test("should throw 400 when the boost session has expired", async () => {
    mockRedisGet.mockResolvedValueOnce(null as never);

    await expect(
      gradeMcqBoost(
        TEST_USER_ID,
        TEST_SKILL,
        MCQ_IDS.map((id) => ({ questionId: id, answerIndex: 0 })),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("expired"),
    });
  });

  // --- Wrong session type: session is for compiler but MCQ submitted ---
  test("should throw 403 when session type is 'compiler' but MCQ is submitted", async () => {
    const compilerSession = { ...boostSession, type: "compiler" };
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(compilerSession) as never);

    await expect(
      gradeMcqBoost(
        TEST_USER_ID,
        TEST_SKILL,
        MCQ_IDS.map((id) => ({ questionId: id, answerIndex: 0 })),
      ),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("Invalid session"),
    });

    expect(mockRedisDel).toHaveBeenCalledWith(`boost_session:${TEST_USER_ID}`);
  });

  // --- Skill mismatch: session is for "python" but submitting for "javascript" ---
  test("should throw 403 when skillName does not match the boost session", async () => {
    const pythonSession = { ...boostSession, skillName: "python" };
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(pythonSession) as never);

    await expect(
      gradeMcqBoost(
        TEST_USER_ID,
        "javascript", // ← different skill from session
        MCQ_IDS.map((id) => ({ questionId: id, answerIndex: 0 })),
      ),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  // --- Correct boost scoring: each correct MCQ = +1 to hike ---
  test("should return correct hike for 3 correct MCQ answers", async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(boostSession) as never);

    // DB questions with known correct answers
    mockFindManyForGrading.mockResolvedValueOnce([
      { questionId: "MCQ-JS-BEG-001", correctAnswerIndex: 0 },
      { questionId: "MCQ-JS-BEG-002", correctAnswerIndex: 1 },
      { questionId: "MCQ-JS-BEG-003", correctAnswerIndex: 2 },
      { questionId: "MCQ-JS-BEG-004", correctAnswerIndex: 1 },
      { questionId: "MCQ-JS-BEG-005", correctAnswerIndex: 2 },
    ] as never);

    // User answers: 3 correct, 2 wrong
    const answers = [
      { questionId: "MCQ-JS-BEG-001", answerIndex: 0 }, // ✓
      { questionId: "MCQ-JS-BEG-002", answerIndex: 1 }, // ✓
      { questionId: "MCQ-JS-BEG-003", answerIndex: 2 }, // ✓
      { questionId: "MCQ-JS-BEG-004", answerIndex: 0 }, // ✗
      { questionId: "MCQ-JS-BEG-005", answerIndex: 0 }, // ✗
    ];

    const currentScore = 60;
    mockSkillFindOne.mockResolvedValueOnce({
      currentScore,
      save: jest.fn().mockResolvedValue(undefined as never),
    } as never);

    const result = await gradeMcqBoost(TEST_USER_ID, TEST_SKILL, answers);

    expect(result.correctCount).toBe(3);
    expect(result.hikeApplied).toBe(3); // 3 correct × 1 point each
    expect(result.newScore).toBe(63); // 60 + 3
  });

  // --- Score cap: score cannot exceed 100 ---
  test("should cap the new score at 100 even if hike would exceed it", async () => {
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(boostSession) as never);

    mockFindManyForGrading.mockResolvedValueOnce([
      { questionId: "MCQ-JS-BEG-001", correctAnswerIndex: 0 },
      { questionId: "MCQ-JS-BEG-002", correctAnswerIndex: 0 },
      { questionId: "MCQ-JS-BEG-003", correctAnswerIndex: 0 },
      { questionId: "MCQ-JS-BEG-004", correctAnswerIndex: 0 },
      { questionId: "MCQ-JS-BEG-005", correctAnswerIndex: 0 },
    ] as never);

    // All 5 correct — hike = 5
    const answers = MCQ_IDS.map((id) => ({ questionId: id, answerIndex: 0 }));

    const currentScore = 98; // 98 + 5 would be 103 — must cap at 100
    mockSkillFindOne.mockResolvedValueOnce({
      currentScore,
      save: jest.fn().mockResolvedValue(undefined as never),
    } as never);

    const result = await gradeMcqBoost(TEST_USER_ID, TEST_SKILL, answers);

    expect(result.newScore).toBe(100); // capped
    expect(result.correctCount).toBe(5);
    expect(result.hikeApplied).toBe(5);
  });
});
