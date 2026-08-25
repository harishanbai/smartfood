import api from '../api';

/**
 * Payment Service for handling real-time transaction fetching, auto-verification, and dynamic recording.
 */
export const paymentService = {
  /**
   * Fetch payment transaction history logs
   */
  getPayments: async () => {
    const res = await api.get('/payments');
    return res.data;
  },

  /**
   * Record a new dynamic payment transaction
   * @param {Object} paymentData - { amount, description, paymentType, referenceNo, upiId, upiName, bankName }
   */
  createPayment: async (paymentData) => {
    const res = await api.post('/payments', paymentData);
    return res.data;
  },

  /**
   * Verify and confirm an active QR payment session
   * @param {Object} verifyData - { amount, referenceNo, description, upiId, upiName }
   */
  verifyActivePayment: async (verifyData) => {
    const res = await api.post('/payments/verify-active', verifyData);
    return res.data;
  },

  /**
   * Trigger payment simulation / webhook callback test
   * @param {Object} paymentData - { amount, description, upiId, upiName }
   */
  simulatePayment: async (paymentData) => {
    const res = await api.post('/payments/simulate', paymentData);
    return res.data;
  },

  /**
   * Delete a payment record
   * @param {string} id - Transaction ID or Document ID
   */
  deletePayment: async (id) => {
    const res = await api.delete(`/payments/${id}`);
    return res.data;
  }
};

export default paymentService;
