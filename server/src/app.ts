import express, { type Application } from "express";
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

app.get("/health", (_, res) => {
  res.status(200).json({ status: "active", timestamp: new Date() });
});

export default app;
