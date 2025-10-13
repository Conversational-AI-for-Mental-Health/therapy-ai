import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan"; // Added morgan here for logging request which only work doing NODE_ENV=development
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

  // --- Request Logging (development only) ---
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // --- Attach API Routes ---
  app.use("/api", apiRouter);

  // Future: Add error handling middleware here
  
  // --- Error Handling Middleware ---
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`(error) ${err.stack}`);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
};
