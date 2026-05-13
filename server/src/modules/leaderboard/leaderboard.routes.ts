import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { fetchLeaderboard } from "./leaderboard.controller.js";

const router = Router();

router.get("/", authenticate, fetchLeaderboard);

export default router;
