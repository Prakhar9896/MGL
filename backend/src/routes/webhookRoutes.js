import express from 'express';
import { handleClerkWebhook } from '../controller/webhookController.js';

const router = express.Router();

// Apply JSON middleware only for webhook routes
router.use(express.json());

// Clerk webhook endpoint (no auth middleware - Clerk signs the request)
router.post('/clerk', handleClerkWebhook);

export default router;
