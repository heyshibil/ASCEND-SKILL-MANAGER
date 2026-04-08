import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/dashboard", authenticate, userController.getDashboardStats);

export default router;