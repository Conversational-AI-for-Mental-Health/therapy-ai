import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
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
  app.use(compression());       // Compress responses for faster API communication
  app.use(morgan("combined"));  // Log requests in Apache combined format

  // --- Attach API Routes ---
  app.use("/api", apiRouter);

  // --- Centralized Error Handling Middleware ---
  app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
};
