import api from '../api';

/**
 * Payment Service for handling real-time transaction fetching, auto-verification, and dynamic recording.
 */
export const paymentService = {
  /**
   * Fetch payment transaction history logs
   */
  getPayments: async (includePending = false) => {
    const res = await api.get(`/payments${includePending ? '?includePending=true' : ''}`);
    return res.data;
  },

  /**
   * Initiates a new QR payment session order in WAITING_FOR_PAYMENT state
   * @param {Object} orderData - { amount, description, referenceNo, upiId, upiName }
   */
  createPaymentOrder: async (orderData) => {
    const res = await api.post('/payments/order', orderData);
    return res.data;
  },

  /**
   * Query real-time payment status by transaction ID
   * @param {string} transactionId
   */
  getPaymentStatus: async (transactionId) => {
    const res = await api.get(`/payments/status/${encodeURIComponent(transactionId)}`);
    return res.data;
  },

  /**
   * Record a new manual or settled payment transaction
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
   * @param {Object} paymentData - { amount, referenceNo, transactionId, description, upiId, upiName }
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
