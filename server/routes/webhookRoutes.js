import express from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/whatsappWebhookController.js';

const router = express.Router();

// Meta WhatsApp Webhook endpoints
router.get('/webhook/whatsapp', verifyWebhook);
router.post('/webhook/whatsapp', handleWebhook);

export default router;
