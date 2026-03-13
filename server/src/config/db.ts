import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) throw new Error("MONGO_URI is not defined in .env");

  await mongoose.connect(MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
