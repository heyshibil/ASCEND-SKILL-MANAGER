import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { updateLastSeen } from "../../middlewares/user.middleware.js";

const router = Router();

router.get("/dashboard", authenticate, updateLastSeen, userController.getDashboardStats);
router.patch("/profile", authenticate, updateLastSeen, userController.updateProfile);
router.post(
  "/email-change/request",
  authenticate,
  updateLastSeen,
  userController.requestEmailChange,
);
router.get("/email-change/verify/:token", userController.verifyEmailChange);
router.post(
  "/password-change/request",
  authenticate,
  updateLastSeen,
  userController.requestPasswordChange,
);
router.get("/password-change/verify/:token", userController.verifyPasswordChange);

// --- ADMIN ROUTES ---
router.get("/admin/all", authenticate, isAdmin, userController.getAllUsers);
router.patch(
  "/admin/status/:userId",
  authenticate,
  isAdmin,
  userController.updateUserStatus,
);

export default router;
