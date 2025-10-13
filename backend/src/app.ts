import express from "express";
import cors from "cors";
import apiRouter from "./routes/api";

/**
 * Builds and configures the Express application instance.
 * @returns An Express application instance.
 */
export const createApp = () => {
  const app = express();

  // --- Middleware ---
  app.use(cors());
  app.use(express.json());

  // --- Attach API Routes ---
  app.use("/api", apiRouter);

  // Future: Add error handling middleware here

  return app;
};
