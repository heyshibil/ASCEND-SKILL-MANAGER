import { Router } from "express";
import * as problemsController from "./problems.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// List problems
router.get("/", authenticate, problemsController.listProblems);

// User stats
router.get("/user/stats", authenticate, problemsController.getUserStats);

// Get single problem
router.get("/:questionId", authenticate, problemsController.getProblem);

// Dry Run
router.post("/:questionId/run", authenticate, problemsController.runProblem);

// Submit solution
router.post(
  "/:questionId/submit",
  authenticate,
  problemsController.submitProblem,
);

export default router;
