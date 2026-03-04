import express from 'express';
import { requestProfessionalSupport } from '../controllers/emergencyController';
import { authenticateUser } from '../middleware/validation';
import { createManualRateLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/schemaValidation';
import { z } from 'zod';

const router = express.Router();
const emergencyRateLimit = createManualRateLimiter({
  windowMs: 60_000,
  maxRequests: 3,
});
const requestSupportBodySchema = z.object({
  userPhone: z.string().optional(),
  reason: z.string().max(500).optional(),
});

// POST /api/emergency/request-support
router.post(
  '/request-support',
  authenticateUser,
  emergencyRateLimit,
  validateBody(requestSupportBodySchema),
  requestProfessionalSupport,
);

export default router;
