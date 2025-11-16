import mongoose from "mongoose";
import config from "../config";

export async function connectDB(): Promise<void> {
  try {
    // optional: silence strictQuery warnings depending on version
    // mongoose.set("strictQuery", false);

    await mongoose.connect(config.MONGODB_URI);

    console.log("[DB] Connected to MongoDB successfully.");
  } catch (error) {
    console.error("[DB] Failed to connect to MongoDB:", error);
    // If DB connection fails, don't run the app in a half-broken state
    process.exit(1);
  }
}
