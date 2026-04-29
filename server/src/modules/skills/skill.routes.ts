import { Router } from "express";
import * as skillController from "./skill.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get("/catalog", authenticate, skillController.getSkillCatalog);

router.get(
  "/admin/catalog",
  authenticate,
  isAdmin,
  skillController.getAdminSkillCatalog,
);
router.post(
  "/admin/catalog",
  authenticate,
  isAdmin,
  skillController.createSkillPreset,
);
router.patch(
  "/admin/catalog/:skillId",
  authenticate,
  isAdmin,
  skillController.updateSkillPreset,
);
router.delete(
  "/admin/catalog/:skillId",
  authenticate,
  isAdmin,
  skillController.deleteSkillPreset,
);

router.post("/init", authenticate, skillController.initializeSkills);

router.post("/add", authenticate, skillController.addSkills);
router.delete("/:skillId", authenticate, skillController.deleteSkill);

router.get("/categorized", authenticate, skillController.categorizeSkills);
router.post("/boost", authenticate, skillController.boostSkills);

export default router;
