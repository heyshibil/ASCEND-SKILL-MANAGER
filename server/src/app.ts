import express, { type Application } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";

const app: Application = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// --- Health Check ---
app.get("/", (_, res) => {
  res.json({ status: "ok", service: "ascend-api" });
});


// -- Routes --
app.use("/api/auth", authRoutes);

// -- Error Handler --
app.use(errorHandler);

export default app;
