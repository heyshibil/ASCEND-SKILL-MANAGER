import express, { type Application } from "express";
import authRoutes from './modules/auth/auth.routes.js'
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/",(_, res) => {
  res.send("hello")
})

// Routes
app.use("/api/auth", authRoutes)

export default app;
