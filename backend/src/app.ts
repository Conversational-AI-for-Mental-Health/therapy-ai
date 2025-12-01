import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isDatabaseConnected } from './config/database';
import apiRouter from './routes/api';
import conversationRoutes from './routes/conversationRoutes';
import userRoutes from './routes/userRoutes';
import config from './config';

export const createApp = () => {
  const app: Application = express();

  // Security & Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging for future work
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Routes (conversation routes first to avoid overlap with apiRouter)
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api', apiRouter);

  // Health check
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'running',
      service: 'Therapy AI Backend',
      database: isDatabaseConnected() ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  return app;
};
