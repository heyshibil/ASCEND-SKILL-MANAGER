import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get("/dashboard", authenticate, userController.getDashboardStats);

// --- ADMIN ROUTES ---
router.get("/admin/all", authenticate, isAdmin, userController.getAllUsers);
router.patch(
  "/admin/status/:userId",
  authenticate,
  isAdmin,
  userController.updateUserStatus,
);

export default router;
