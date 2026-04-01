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

export default router;