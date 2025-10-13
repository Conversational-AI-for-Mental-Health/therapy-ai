import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Defines and validates all necessary application configuration.

interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
}

const config: AppConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  NODE_ENV: process.env.NODE_ENV || "development",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8080",
};

// Simple validation to ensure critical environment variables exist
if (isNaN(config.PORT)) {
  throw new Error("Invalid PORT defined in environment variables.");
}

export default config;
