import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import {
  createQuestion,
  seedBulkQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  toggleVisibility,
  deleteQuestion,
  adminRunCode,
  toggleVerified,
} from "./questions.controller.js";

const router = Router();

router.post("/", authenticate, isAdmin, createQuestion);
router.post("/bulk", authenticate, isAdmin, seedBulkQuestions);
router.get("/", authenticate, isAdmin, getAllQuestions);
router.get("/:questionId", authenticate, isAdmin, getQuestionById);
router.patch("/:questionId", authenticate, isAdmin, updateQuestion);
router.patch("/:questionId/visibility", authenticate, isAdmin, toggleVisibility);
router.patch("/:questionId/verified", authenticate, isAdmin, toggleVerified);
router.delete("/:questionId", authenticate, isAdmin, deleteQuestion);

// Admin run-code: no rate limiter — auth + isAdmin only
router.post("/:questionId/run", authenticate, isAdmin, adminRunCode);

export default router;

