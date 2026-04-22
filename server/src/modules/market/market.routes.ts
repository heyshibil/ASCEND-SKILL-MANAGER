import { Router } from "express";
import {
  addTrendingSkill,
  streamMarketUpdates,
  updateTrendingSkill,
  deleteTrendingSkill,
} from "./market.controller.js";

const router = Router();

router.get("/stream", streamMarketUpdates);
router.post("/trending", addTrendingSkill);
router.put("/trending/:id", updateTrendingSkill);
router.delete("/trending/:id", deleteTrendingSkill);

export default router;
