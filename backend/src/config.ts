import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Defines and validates all necessary application configuration.
interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  MONGODB_URI: string;
}

const config: AppConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  NODE_ENV: process.env.NODE_ENV || "development",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8080",

  // Atlas connection string comes from .env
  MONGODB_URI: process.env.MONGODB_URI || "",
};

// Simple validation to ensure critical environment variables exist
if (isNaN(config.PORT)) {
  throw new Error("Invalid PORT defined in environment variables.");
}

if (!config.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined in environment variables. Please set it in your .env file."
  );
}

export default config;
