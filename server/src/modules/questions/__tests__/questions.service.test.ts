import { jest, test, expect, describe, afterEach } from "@jest/globals";

// Mock the repository — prevents real Prisma/database calls
// generateNextQuestionId is the only function called by the service
jest.unstable_mockModule("../questions.repository.js", () => ({
  generateNextQuestionId: jest.fn(),
  // Stub all other exports so the module loads without error
  insertQuestion: jest.fn(),
  findByQuestionId: jest.fn(),
  findRandomQuestions: jest.fn(),
  findManyByQuestionIds: jest.fn(),
  listQuestions: jest.fn(),
  updateQuestion: jest.fn(),
  listQuestionsAdmin: jest.fn(),
  deleteQuestionByQuestionId: jest.fn(),
  findVerifiedCodeQuestion: jest.fn(),
  findManyQuestionsForGrading: jest.fn(),
  countQuestionsByType: jest.fn(),
}));

// Dynamic imports after mock declarations
const { generateQuestionId } = await import("../questions.service.js");
const { generateNextQuestionId } = await import("../questions.repository.js");

// ─── generateQuestionId ────────────────────────────────────────────────────────
// This builds the unique questionId format: TYPE-SKILL-LEVEL-NNN
// Wrong prefix = wrong bucket = duplicate key collisions in production
describe("generateQuestionId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Skill mapping (known skills get short codes) ---
  test("should map 'javascript' skill to 'JS' in the prefix", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-BEG-001" as never);

    await generateQuestionId("mcq", "javascript", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-JS-BEG");
  });

  test("should map 'python' skill to 'PY' in the prefix", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("CODE-PY-INT-001" as never);

    await generateQuestionId("code", "python", "intermediate");

    expect(generateNextQuestionId).toHaveBeenCalledWith("CODE-PY-INT");
  });

  test("should map 'typescript' skill to 'TS' in the prefix", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-TS-ADV-001" as never);

    await generateQuestionId("mcq", "typescript", "advanced");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-TS-ADV");
  });

  test("should map 'react' skill to 'REA' in the prefix", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-REA-BEG-001" as never);

    await generateQuestionId("mcq", "react", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-REA-BEG");
  });

  test("should map 'mongodb' skill to 'MDB' in the prefix", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-MDB-INT-001" as never);

    await generateQuestionId("mcq", "mongodb", "intermediate");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-MDB-INT");
  });

  // --- Unknown skill fallback: uses first 3 chars uppercased ---
  test("should use first 3 chars of unknown skill name", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-RUS-BEG-001" as never);

    await generateQuestionId("mcq", "rust", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-RUS-BEG");
  });

  test("should use first 3 chars of another unknown skill", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-GOL-BEG-001" as never);

    await generateQuestionId("mcq", "golang", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-GOL-BEG");
  });

  // --- Type prefix: 'code' → 'CODE', anything else → 'MCQ' ---
  test("should use 'CODE' prefix for code type questions", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("CODE-JS-ADV-001" as never);

    await generateQuestionId("code", "javascript", "advanced");

    expect(generateNextQuestionId).toHaveBeenCalledWith("CODE-JS-ADV");
  });

  test("should use 'MCQ' prefix for mcq type questions", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-BEG-001" as never);

    await generateQuestionId("mcq", "javascript", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-JS-BEG");
  });

  // --- Level truncation: only first 3 chars uppercased ---
  test("should truncate 'beginner' to 'BEG'", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-BEG-001" as never);

    await generateQuestionId("mcq", "javascript", "beginner");

    expect(generateNextQuestionId).toHaveBeenCalledWith(
      expect.stringMatching(/-BEG$/)
    );
  });

  test("should truncate 'intermediate' to 'INT'", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-INT-001" as never);

    await generateQuestionId("mcq", "javascript", "intermediate");

    expect(generateNextQuestionId).toHaveBeenCalledWith(
      expect.stringMatching(/-INT$/)
    );
  });

  test("should truncate 'advanced' to 'ADV'", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-ADV-001" as never);

    await generateQuestionId("mcq", "javascript", "advanced");

    expect(generateNextQuestionId).toHaveBeenCalledWith(
      expect.stringMatching(/-ADV$/)
    );
  });

  // --- Return value: passes through what generateNextQuestionId returns ---
  test("should return the value from generateNextQuestionId", async () => {
    const expectedId = "MCQ-JS-BEG-007";
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce(expectedId as never);

    const result = await generateQuestionId("mcq", "javascript", "beginner");

    expect(result).toBe(expectedId);
  });

  // --- Skill key is lowercased before lookup ---
  test("should normalize skill name to lowercase before mapping", async () => {
    (generateNextQuestionId as jest.Mock).mockResolvedValueOnce("MCQ-JS-BEG-001" as never);

    await generateQuestionId("mcq", "JavaScript", "beginner"); // mixed case

    // Should still produce JS not JAV (first 3 chars of "JavaScript")
    expect(generateNextQuestionId).toHaveBeenCalledWith("MCQ-JS-BEG");
  });
});
