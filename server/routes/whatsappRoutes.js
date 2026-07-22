import express from 'express';
import { sendMenuNotification } from '../controllers/whatsappController.js';

const router = express.Router();

router.post('/send', sendMenuNotification);

export default router;
