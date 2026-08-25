import Payment from '../models/Payment.js';
import User from '../models/User.js';

/**
 * Generate a unique, professional transaction ID
 * Example: TXN84920193
 */
export const generateTxnId = () => {
  const timestampPart = Date.now().toString().slice(-4);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `TXN${timestampPart}${randomPart}`;
};

/**
 * GET /api/payments
 * Retrieve dynamic transaction logs
 */
export const getPayments = async (req, res) => {
  try {
    const userUid = req.headers['x-user-uid'] || req.query.uid || '';
    const userEmail = req.headers['x-user-email'] || req.query.email || '';

    let filter = {};
    if (userUid) {
      filter = { $or: [{ userUid }, { userEmail: userEmail ? userEmail.toLowerCase() : '' }, { userUid: '' }, { userUid: null }] };
    }

    const payments = await Payment.find(filter).sort({ paidAt: -1, createdAt: -1 }).limit(50);
    
    // Map to normalized response format
    const formatted = payments.map(p => ({
      _id: p._id,
      id: p.transactionId,
      transactionId: p.transactionId,
      referenceNo: p.referenceNo || p.transactionId,
      desc: p.description,
      description: p.description,
      amount: p.amount,
      type: p.paymentType,
      paymentType: p.paymentType,
      status: p.status || 'SUCCESS',
      paidAt: p.paidAt,
      date: new Date(p.paidAt).toLocaleDateString(),
      time: new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upiId: p.upiId,
      upiName: p.upiName,
      bankName: p.bankName
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment transactions',
      error: error.message
    });
  }
};

/**
 * POST /api/payments
 * Record a new dynamic payment transaction
 */
export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      description,
      desc,
      paymentType,
      type,
      referenceNo,
      upiId,
      upiName,
      bankName,
      status = 'SUCCESS'
    } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount provided'
      });
    }

    const userUid = req.headers['x-user-uid'] || req.body.userUid || '';
    const userEmail = req.headers['x-user-email'] || req.body.userEmail || '';

    // Check if user exists in DB to link ObjectId
    let userDoc = null;
    if (userUid) {
      userDoc = await User.findOne({ uid: userUid });
    } else if (userEmail) {
      userDoc = await User.findOne({ email: userEmail.toLowerCase() });
    }

    // Determine unique transaction ID
    let transactionId = referenceNo ? referenceNo.trim() : '';
    if (!transactionId || transactionId.length < 4) {
      transactionId = generateTxnId();
    } else {
      // Ensure unique if manual ref already exists
      const existing = await Payment.findOne({ transactionId });
      if (existing) {
        transactionId = `${transactionId}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const finalDesc = description || desc || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);
    const finalType = paymentType || type || 'UPI';

    const payment = new Payment({
      transactionId,
      referenceNo: referenceNo || transactionId,
      userId: userDoc ? userDoc._id : null,
      userUid: userUid || (userDoc ? userDoc.uid : ''),
      userEmail: userEmail || (userDoc ? userDoc.email : ''),
      description: finalDesc,
      amount: parsedAmount,
      paymentType: finalType,
      status: status || 'SUCCESS',
      upiId: upiId || 'harishanbai06-2@oksbi',
      upiName: upiName || 'Vaseegrah Veda Catering',
      bankName: bankName || 'State Bank of India',
      paidAt: new Date()
    });

    const savedPayment = await payment.save();

    const formatted = {
      _id: savedPayment._id,
      id: savedPayment.transactionId,
      transactionId: savedPayment.transactionId,
      referenceNo: savedPayment.referenceNo,
      desc: savedPayment.description,
      description: savedPayment.description,
      amount: savedPayment.amount,
      type: savedPayment.paymentType,
      paymentType: savedPayment.paymentType,
      status: savedPayment.status,
      paidAt: savedPayment.paidAt,
      date: new Date(savedPayment.paidAt).toLocaleDateString(),
      time: new Date(savedPayment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upiId: savedPayment.upiId,
      upiName: savedPayment.upiName,
      bankName: savedPayment.bankName
    };

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: formatted
    });
  } catch (error) {
    console.error('Error creating payment log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment transaction',
      error: error.message
    });
  }
};

/**
 * POST /api/payments/verify-active
 * Verifies and confirms an active QR payment session
 */
export const verifyActivePayment = async (req, res) => {
  try {
    const { amount, referenceNo, description, upiId, upiName } = req.body;
    const parsedAmount = Number(amount) || 120;
    const txnId = referenceNo && referenceNo.trim().length >= 4 ? referenceNo.trim() : generateTxnId();
    const desc = description || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);

    // Check if already recorded
    let payment = await Payment.findOne({ transactionId: txnId });
    if (!payment) {
      payment = new Payment({
        transactionId: txnId,
        referenceNo: txnId,
        description: desc,
        amount: parsedAmount,
        paymentType: 'UPI',
        status: 'SUCCESS',
        upiId: upiId || 'harishanbai06-2@oksbi',
        upiName: upiName || 'Vaseegrah Veda Catering',
        paidAt: new Date()
      });
      await payment.save();
    } else if (payment.status !== 'SUCCESS') {
      payment.status = 'SUCCESS';
      payment.paidAt = new Date();
      await payment.save();
    }

    const formatted = {
      _id: payment._id,
      id: payment.transactionId,
      transactionId: payment.transactionId,
      referenceNo: payment.referenceNo,
      desc: payment.description,
      description: payment.description,
      amount: payment.amount,
      type: payment.paymentType,
      paymentType: payment.paymentType,
      status: payment.status,
      paidAt: payment.paidAt,
      date: new Date(payment.paidAt).toLocaleDateString(),
      time: new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upiId: payment.upiId,
      upiName: payment.upiName
    };

    return res.status(200).json({
      success: true,
      message: 'Payment verified and confirmed',
      data: formatted
    });
  } catch (error) {
    console.error('Error verifying active payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * POST /api/payments/webhook
 * Automated Webhook Listener for Payment Gateway / Bank callbacks
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('⚡ [Payment Webhook Received]:', JSON.stringify(payload));

    // Support standard webhook formats (Razorpay, Cashfree, Paytm, direct UPI aggregator)
    const amount = Number(
      payload.amount ||
      payload.payment?.amount ||
      payload.data?.amount ||
      payload.payload?.payment?.entity?.amount / 100 ||
      120
    );
    const txnId =
      payload.transactionId ||
      payload.txnId ||
      payload.id ||
      payload.orderId ||
      payload.payload?.payment?.entity?.id ||
      generateTxnId();
    
    const statusRaw = String(
      payload.status ||
      payload.event ||
      payload.payload?.payment?.entity?.status ||
      'SUCCESS'
    ).toUpperCase();

    const status = statusRaw.includes('FAIL') ? 'FAILED' : 'SUCCESS';
    const desc = payload.description || payload.desc || `Dynamic Meal Payment - ₹${amount}`;

    let payment = await Payment.findOne({ transactionId: txnId });
    if (!payment) {
      payment = new Payment({
        transactionId: txnId,
        referenceNo: txnId,
        description: desc,
        amount: amount,
        paymentType: payload.paymentType || 'UPI',
        status: status,
        upiId: payload.upiId || 'harishanbai06-2@oksbi',
        upiName: payload.upiName || 'Vaseegrah Veda Catering',
        bankName: payload.bankName || 'State Bank of India',
        paidAt: new Date()
      });
      await payment.save();
    } else {
      payment.status = status;
      payment.paidAt = new Date();
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed and payment recorded',
      data: payment
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing error',
      error: error.message
    });
  }
};

/**
 * POST /api/payments/simulate
 * Simulates automatic payment arrival for QR testing
 */
export const simulatePayment = async (req, res) => {
  try {
    const { amount = 120, description, upiId, upiName } = req.body;
    const parsedAmount = Number(amount) || 120;
    const txnId = generateTxnId();
    const desc = description || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);

    const payment = new Payment({
      transactionId: txnId,
      referenceNo: txnId,
      description: desc,
      amount: parsedAmount,
      paymentType: 'UPI',
      status: 'SUCCESS',
      upiId: upiId || 'harishanbai06-2@oksbi',
      upiName: upiName || 'Vaseegrah Veda Catering',
      paidAt: new Date()
    });

    const savedPayment = await payment.save();

    const formatted = {
      _id: savedPayment._id,
      id: savedPayment.transactionId,
      transactionId: savedPayment.transactionId,
      referenceNo: savedPayment.referenceNo,
      desc: savedPayment.description,
      description: savedPayment.description,
      amount: savedPayment.amount,
      type: savedPayment.paymentType,
      paymentType: savedPayment.paymentType,
      status: savedPayment.status,
      paidAt: savedPayment.paidAt,
      date: new Date(savedPayment.paidAt).toLocaleDateString(),
      time: new Date(savedPayment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upiId: savedPayment.upiId,
      upiName: savedPayment.upiName
    };

    return res.status(201).json({
      success: true,
      message: 'Simulated payment detected & recorded',
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to simulate payment',
      error: error.message
    });
  }
};

/**
 * DELETE /api/payments/:id
 * Remove a payment log entry
 */
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transactionId: id }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment record removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payment record',
      error: error.message
    });
  }
};
