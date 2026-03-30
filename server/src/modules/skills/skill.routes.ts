import { Router } from "express";
import * as skillController from "./skill.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/init", authenticate, skillController.initializeSkills);

export default router;
