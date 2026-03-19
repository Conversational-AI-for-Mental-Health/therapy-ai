import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isDatabaseConnected } from './config/database';
import apiRouter from './routes/api';
import conversationRoutes from './routes/conversationRoutes';
import userRoutes from './routes/userRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import chatRoutes from './routes/chat';
import journalRoutes from './routes/journalRoutes';
import config from './config';

export const createApp = () => {
  const app: Application = express();
  const isProduction = config.NODE_ENV === 'production';
  const allowedOrigins = new Set(config.CORS_ORIGINS);

  // Required when running behind reverse proxies/load balancers.
  app.set('trust proxy', 1);

  // Security & Middleware
  app.use(
    helmet({
      hsts: isProduction
        ? {
            maxAge: 15552000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    }),
  );

  // Enforce HTTPS in production (requires trust proxy above)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (isProduction) {
      const protoHeader = req.headers['x-forwarded-proto'];
      const forwardedProto = Array.isArray(protoHeader)
        ? protoHeader[0]
        : protoHeader;
      if (forwardedProto !== 'https') {
        return res.status(426).json({
          success: false,
          error: 'HTTPS is required',
        });
      }
    }
    return next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without an Origin header (native apps, curl).
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.has(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS origin denied'));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  //  Skips Cypress tests to prevent rate limiting during test runs
  const skipForCypress = (req: Request): boolean =>
    req.headers['x-cypress-test'] === 'true';

  // Rate limiters
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: skipForCypress,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
    handler: (req, res, _next, options) => {
      console.warn(`[RATE LIMIT] General limit hit: ${req.ip} -> ${req.originalUrl}`);
      res.status(options.statusCode).send(options.message);
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skip: skipForCypress,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many login attempts, please try again later.' },
    handler: (req, res, _next, options) => {
      console.warn(`[RATE LIMIT] Auth limit hit: ${req.ip} -> ${req.originalUrl}`);
      res.status(options.statusCode).send(options.message);
    },
  });

  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  app.use('/api/', generalLimiter);

  // Request logging (logs on response finish — includes status code)
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode}`);
    });
    next();
  });

  // Routes
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/emergency', emergencyRoutes);
  app.use('/api/chat', chatRoutes);
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

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error',
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