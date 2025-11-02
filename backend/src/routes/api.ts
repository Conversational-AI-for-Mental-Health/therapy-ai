import axios from "axios";
import http from "http";
import { Router, Request, Response } from "express";

const apiRouter = Router();
const PYTHON_API_URL = "http://127.0.0.1:5000/chat";

// Create Axios instance with keep-alive and timeout
const axiosInstance = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 5000, // 5-second timeout
  httpAgent: new http.Agent({ keepAlive: true }),
});

// Health check endpoint
apiRouter.get("/status", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Backend API is running",
    service: "Mental Health Chatbot API",
  });
});

// Main route to communicate with Python AI backend
apiRouter.post("/message", async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const response = await axiosInstance.post("", { message });
    res.status(200).json({ aiResponse: response.data.response });
  } catch (err: any) {
    console.error("[Error connecting to AI backend]", err.message || err);
    res.status(500).json({ error: "Failed to connect to AI backend" });
  }
});

export default apiRouter;
