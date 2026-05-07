import { Router } from "express";
import * as verificationController from "./verification.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/start",
  authenticate,
  verificationController.startVerificationTest,
);

router.post(
  "/submit",
  authenticate,
  verificationController.submitVerificationTest,
);

// Boost skill routes
router.get(
  "/boost/generate",
  authenticate,
  verificationController.generateBoost,
);

router.post(
  "/boost/mcq/submit",
  authenticate,
  verificationController.submitMcqBoost,
);

router.post(
  "/boost/compiler/submit",
  authenticate,
  verificationController.submitCompilerBoost,
);

router.post("/run-code", authenticate, verificationController.runCode);

export default router;
