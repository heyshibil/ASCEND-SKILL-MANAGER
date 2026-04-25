import { Router } from "express";
import * as skillController from "./skill.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/init", authenticate, skillController.initializeSkills);

router.post("/add", authenticate, skillController.addSkills);
router.delete("/:skillId", authenticate, skillController.deleteSkill);

router.get("/categorized", authenticate, skillController.categorizeSkills);
router.post("/boost", authenticate, skillController.boostSkills);

export default router;
