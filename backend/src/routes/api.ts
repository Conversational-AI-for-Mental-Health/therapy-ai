import { Router, Request, Response } from 'express';

const apiRouter = Router();

// Basic health/status endpoint. Conversation routes live in conversationRoutes.ts.
apiRouter.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Backend API is running',
    service: 'Mental Health Chatbot API',
  });
});

export default apiRouter;
