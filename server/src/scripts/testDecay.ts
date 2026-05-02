import "dotenv/config";
import mongoose from "mongoose";
import { runDecayTick } from "../modules/decay-engine/decay.service.js";

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Running test decay tick (simulating 6 hours)...");

  const result = await runDecayTick(6);
  console.log("Result:", JSON.stringify(result, null, 2));

  await mongoose.disconnect();
};

test().catch(console.error);
