import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Skill } from "../models/Skill.js";
import { runDecayTick } from "../modules/decay-engine/decay.service.js";

const triggerNotification = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB...");

    // Find the first active user
    const user = await User.findOne({ status: "active", onboardingStatus: "completed" });
    if (!user) {
      console.log("❌ No active, onboarding-completed user found. Please sign up and complete onboarding first!");
      mongoose.connection.close();
      return;
    }

    console.log(`Found user: ${user.username} (${user._id})`);

    // Find a skill for this user
    const skill = await Skill.findOne({ userId: user._id });
    if (!skill) {
      console.log("❌ This user has no skills. Please add some skills in the dashboard first!");
      mongoose.connection.close();
      return;
    }

    console.log(`Found skill: ${skill.name} (Current Score: ${skill.currentScore}, lastNotifiedStatus: ${skill.lastNotifiedStatus})`);

    // We want to force a status transition from healthy -> draining.
    // Draining starts below 70. Let's set the score to 70.5 so that any decay drops it below 70.
    console.log("Setting skill score to 70.5 (healthy) and lastNotifiedStatus to null...");
    skill.currentScore = 70.5;
    skill.lastNotifiedStatus = null;
    await skill.save();

    console.log("Running decay tick simulating 240 hours (10 days) to guarantee it exceeds threshold...");
    const result = await runDecayTick(240);

    console.log("Decay Tick Result:", JSON.stringify(result, null, 2));

    // Reload the skill to see updated values
    const updatedSkill = await Skill.findById(skill._id);
    console.log(`Updated skill: ${updatedSkill?.name} (New Score: ${updatedSkill?.currentScore}, New lastNotifiedStatus: ${updatedSkill?.lastNotifiedStatus})`);

    mongoose.connection.close();
    console.log("✅ Done! If your development server is running, check your browser dashboard. You should see a new notification badge and item in the Unread tab.");
  } catch (error) {
    console.error("Error triggering notification:", error);
    process.exit(1);
  }
};

triggerNotification();
