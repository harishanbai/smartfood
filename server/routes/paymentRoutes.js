import express from 'express';
import {
  getPayments,
  createPayment,
  verifyActivePayment,
  handlePaymentWebhook,
  simulatePayment,
  deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getPayments);
router.post('/', createPayment);
router.post('/verify-active', verifyActivePayment);
router.post('/webhook', handlePaymentWebhook);
router.post('/simulate', simulatePayment);
router.delete('/:id', deletePayment);

export default router;
