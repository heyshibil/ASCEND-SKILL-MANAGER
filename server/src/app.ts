import express, { type Application } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import skillRoutes from "./modules/skills/skill.routes.js";
import verificationRoutes from "./modules/verification/verification.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import questionRoutes from "./modules/questions/questions.routes.js";
import marketRoutes from "./modules/market/market.routes.js";
import problemRoutes from "./modules/problems/problems.routes.js"
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// --- Health Check ---
app.get("/", (_, res) => {
  res.json({ status: "ok", service: "ascend-api" });
});

// -- Routes --
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/users", userRoutes);
+app.use("/api/problems", problemRoutes);


// -- Admin Routes --
app.use("/api/admin/questions", questionRoutes);
app.use("/api/market", marketRoutes);

// -- Error Handler --
app.use(errorHandler);

export default app;
