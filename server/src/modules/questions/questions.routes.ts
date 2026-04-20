import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { createQuestion } from "./questions.controller.js";

const router = Router();

router.post("/", authenticate, isAdmin, createQuestion);

export default router;