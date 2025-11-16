import axios from "axios";
import { Router, Request, Response } from "express";
import chatRouter from "./chat"; //  NEW: chat routes for Mongo-backed chat

const apiRouter = Router();
const PYTHON_API_URL = "http://127.0.0.1:5000/chat";

// Simple health/status endpoint
apiRouter.get("/status", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Backend API is running",
    service: "Mental Health Chatbot API",
  });
});

// Main route to communicate with Flask AI (Python LLM backend)
apiRouter.post("/message", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const response = await axios.post(PYTHON_API_URL, { message });
    res.status(200).json({ aiResponse: response.data.response });
  } catch (err) {
    console.error("[Error connecting to AI backend]", err);
    res.status(500).json({ error: "Failed to connect to AI backend" });
  }
});

// Chat routes for conversation persistence & history (Mongo-backed)
apiRouter.use("/chat", chatRouter);

export default apiRouter;
