import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || "";
const MONGO_URI = process.env.MONGO_URI || "";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("mongodb connected");

    app.listen(PORT, () => {
      console.log(`server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
