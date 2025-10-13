import { Router, Request, Response } from "express";

const apiRouter = Router();

apiRouter.get("/status", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Backend API is running",
    service: "Mental Health Chatbot API",
  });
});

export default apiRouter;
