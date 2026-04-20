import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { createQuestion, seedBulkQuestions } from "./questions.controller.js";

const router = Router();

router.post("/", authenticate, isAdmin, createQuestion);
router.post("/bulk", authenticate, isAdmin, seedBulkQuestions)

export default router;