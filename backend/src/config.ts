import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // just to make sure .env loads if scripts aren't in proper directories

// Defines and validates all necessary application configuration.

interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  // DATABASE_URL: string;
}

const config: AppConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  NODE_ENV: process.env.NODE_ENV || "development",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8080",

  // DATABASE_URL: process.env.DATABASE_URL || "",
};

// Simple validation to ensure critical environment variables exist
if (isNaN(config.PORT)) {
  throw new Error("Invalid PORT defined in environment variables.");
}

if (!config.CORS_ORIGIN) {
  console.warn("(config) Warning: CORS_ORIGIN not set, defaulting to localhost:8080");
}

export default config;
