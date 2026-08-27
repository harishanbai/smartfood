import express from 'express';
import {
  getPayments,
  createPayment,
  createPaymentOrder,
  getPaymentStatus,
  verifyActivePayment,
  handlePaymentWebhook,
  simulatePayment,
  deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getPayments);
router.post('/order', createPaymentOrder);
router.get('/status/:transactionId', getPaymentStatus);
router.post('/verify-active', verifyActivePayment);
router.post('/webhook', handlePaymentWebhook);
router.post('/simulate', simulatePayment);
router.post('/', createPayment);
router.delete('/:id', deletePayment);

export default router;
