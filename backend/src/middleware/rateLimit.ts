import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const createManualRateLimiter = ({
  windowMs,
  maxRequests,
}: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Bypass rate limiting for Cypress tests
    if (req.headers['x-cypress-test'] === 'true') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
      });
    }

    existing.count += 1;
    rateLimitStore.set(key, existing);
    return next();
  };
};