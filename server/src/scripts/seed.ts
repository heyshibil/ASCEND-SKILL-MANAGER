import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Question } from "../models/Question.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to database for seeding...");

    // Clear existing questions (Optional: only if you want a fresh start)
    // await Question.deleteMany({});
    // console.log("Cleared existing questions.");

    const questions = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../seeds/questions.json"), "utf8"),
    );

    await Question.insertMany(questions);
    console.log(`${questions.length} Questions seeded`);

    // 5. Close connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();
