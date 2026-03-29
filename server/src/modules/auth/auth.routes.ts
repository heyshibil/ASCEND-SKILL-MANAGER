import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/github/callback", authController.githubCallback);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/logout", authController.logout)

// Protected routes
router.get("/me", authenticate, authController.getMe);

export default router;
