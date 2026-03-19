import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/schemaValidation';
import { z } from 'zod';

const apiRouter = Router();

const messageBodySchema = z.object({
  message: z.string().min(1).max(10000),
});

// Health check endpoint
// GET /api/status
apiRouter.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Backend API is running',
    service: 'Mental Health Chatbot API',
  });
});

export default apiRouter;