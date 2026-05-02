import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./workers/scan.worker.js"
import "./workers/decay.worker.js"
import { registerDecayJob } from "./jobs/decay.job.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Register bg jobs
    await registerDecayJob();

    app.listen(PORT, () => {
      console.log(`server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
