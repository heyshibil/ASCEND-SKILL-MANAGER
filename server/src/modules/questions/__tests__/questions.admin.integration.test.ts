import dotenv from "dotenv";
dotenv.config();
import { jest, test, expect, describe, afterEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

// --- DECLARE ALL MOCKS BEFORE DYNAMIC IMPORTS ---

// Mock Redis
jest.unstable_mockModule("../../../config/redis.js", () => ({
  redisConnection: {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock Queue
jest.unstable_mockModule("../../../queues/scan.queue.js", () => ({
  scanQueue: {
    add: jest.fn(),
    getJob: jest.fn(),
  },
}));

// Mock User model — for authenticate and isAdmin middlewares
const mockFindById = jest.fn() as any;
jest.unstable_mockModule("../../../models/User.js", () => ({
  User: {
    findById: mockFindById,
  },
}));

// Mock questions.repository
const mockInsertQuestion = jest.fn() as any;
const mockListQuestionsAdmin = jest.fn() as any;
const mockUpdateQuestion = jest.fn() as any;
const mockDeleteQuestionByQuestionId = jest.fn() as any;
const mockFindByQuestionId = jest.fn() as any;

jest.unstable_mockModule("../questions.repository.js", () => ({
  insertQuestion: mockInsertQuestion,
  listQuestionsAdmin: mockListQuestionsAdmin,
  updateQuestion: mockUpdateQuestion,
  deleteQuestionByQuestionId: mockDeleteQuestionByQuestionId,
  findByQuestionId: mockFindByQuestionId,
  // Other unused exports
  generateNextQuestionId: jest.fn(),
  findRandomQuestions: jest.fn(),
  findManyByQuestionIds: jest.fn(),
  listQuestions: jest.fn(),
  findVerifiedCodeQuestion: jest.fn(),
  findManyQuestionsForGrading: jest.fn(),
  countQuestionsByType: jest.fn(),
}));

// Mock questions.service
const mockGenerateQuestionId = jest.fn() as any;
jest.unstable_mockModule("../questions.service.js", () => ({
  generateQuestionId: mockGenerateQuestionId,
}));

// Dynamic import of app
const { default: app } = await import("../../../app.js");

// Helper to sign user tokens
const signToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

// Setup middleware stubs to bypass authenticate & isAdmin
const mockAdminUser = (userId: string) => {
  // authenticate middleware calls select().lean()
  mockFindById.mockReturnValueOnce({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: userId,
        status: "active",
      } as never),
    }),
  });

  // isAdmin middleware calls findById().lean() directly
  mockFindById.mockReturnValueOnce({
    lean: jest.fn().mockResolvedValue({
      _id: userId,
      role: "admin",
    } as never),
  });
};

describe("Questions Admin REST Endpoints", () => {
  const adminToken = signToken("admin-id");

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /api/admin/questions/ (createQuestion) ───────────────────────────
  describe("POST /api/admin/questions", () => {
    const validPayload = {
      type: "mcq",
      skill: "javascript",
      level: "beginner",
      topic: "Closures",
      question: "What is a closure?",
      options: ["A", "B", "C", "D"],
      correctAnswerIndex: 0,
    };

    test("should return 401 when no token is provided", async () => {
      const res = await request(app)
        .post("/api/admin/questions")
        .send(validPayload);
      expect(res.status).toBe(401);
    });

    test("should return 403 when user is not admin", async () => {
      // User is active, but not admin
      mockFindById.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          lean: (jest.fn() as any).mockResolvedValue({ _id: "user-id", status: "active" }),
        }),
      });
      mockFindById.mockReturnValueOnce({
        lean: (jest.fn() as any).mockResolvedValue({ _id: "user-id", role: "user" }),
      });

      const userToken = signToken("user-id");
      const res = await request(app)
        .post("/api/admin/questions")
        .set("Cookie", [`token=${userToken}`])
        .send(validPayload);

      expect(res.status).toBe(403);
    });

    test("should create question and return 201 for valid request as admin", async () => {
      mockAdminUser("admin-id");
      mockGenerateQuestionId.mockResolvedValueOnce("MCQ-JS-BEG-100");
      mockInsertQuestion.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
        ...validPayload,
      });

      const res = await request(app)
        .post("/api/admin/questions")
        .set("Cookie", [`token=${adminToken}`])
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.question.questionId).toBe("MCQ-JS-BEG-100");
    });
  });

  // ─── GET /api/admin/questions/ (getAllQuestions) ──────────────────────────
  describe("GET /api/admin/questions", () => {
    test("should list all questions with pagination for admin", async () => {
      mockAdminUser("admin-id");
      mockListQuestionsAdmin.mockResolvedValueOnce({
        questions: [{ questionId: "MCQ-JS-BEG-100", topic: "Closures" }],
        total: 1,
      });

      const res = await request(app)
        .get("/api/admin/questions")
        .query({ page: 1, limit: 10 })
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions.length).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });
  });

  // ─── PATCH /api/admin/questions/:questionId (updateQuestion) ────────────────
  describe("PATCH /api/admin/questions/:questionId", () => {
    test("should return 404 when question to update does not exist", async () => {
      mockAdminUser("admin-id");
      mockFindByQuestionId.mockResolvedValueOnce(null);

      const res = await request(app)
        .patch("/api/admin/questions/MCQ-JS-BEG-999")
        .set("Cookie", [`token=${adminToken}`])
        .send({ topic: "New Topic" });

      expect(res.status).toBe(404);
    });

    test("should update question topic successfully", async () => {
      mockAdminUser("admin-id");
      mockFindByQuestionId.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
        type: "mcq",
        topic: "Closures",
      });
      mockUpdateQuestion.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
        type: "mcq",
        topic: "New Topic",
      });

      const res = await request(app)
        .patch("/api/admin/questions/MCQ-JS-BEG-100")
        .set("Cookie", [`token=${adminToken}`])
        .send({ topic: "New Topic" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.topic).toBe("New Topic");
    });
  });

  // ─── PATCH /api/admin/questions/:questionId/visibility (toggleVisibility) ────
  describe("PATCH /api/admin/questions/:questionId/visibility", () => {
    test("should toggle visibility successfully", async () => {
      mockAdminUser("admin-id");
      mockUpdateQuestion.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
        isHidden: true,
      });

      const res = await request(app)
        .patch("/api/admin/questions/MCQ-JS-BEG-100/visibility")
        .set("Cookie", [`token=${adminToken}`])
        .send({ isHidden: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isHidden).toBe(true);
    });
  });

  // ─── PATCH /api/admin/questions/:questionId/verified (toggleVerified) ────────
  describe("PATCH /api/admin/questions/:questionId/verified", () => {
    test("should toggle verified status successfully", async () => {
      mockAdminUser("admin-id");
      mockUpdateQuestion.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
        isVerified: true,
      });

      const res = await request(app)
        .patch("/api/admin/questions/MCQ-JS-BEG-100/verified")
        .set("Cookie", [`token=${adminToken}`])
        .send({ isVerified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(true);
    });
  });

  // ─── DELETE /api/admin/questions/:questionId (deleteQuestion) ────────────────
  describe("DELETE /api/admin/questions/:questionId", () => {
    test("should delete question successfully", async () => {
      mockAdminUser("admin-id");
      mockDeleteQuestionByQuestionId.mockResolvedValueOnce({
        questionId: "MCQ-JS-BEG-100",
      });

      const res = await request(app)
        .delete("/api/admin/questions/MCQ-JS-BEG-100")
        .set("Cookie", [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("permanently deleted");
    });
  });
});
