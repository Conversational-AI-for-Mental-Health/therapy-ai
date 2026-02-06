import express from 'express';
import { requestProfessionalSupport } from '../controllers/emergencyController';

const router = express.Router();

// POST /api/emergency/request-support
router.post('/request-support', requestProfessionalSupport);

export default router;
