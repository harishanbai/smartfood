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
 * Helper to build a standard NPCI compliant UPI Payment URI
 */
export const buildUpiUri = ({ upiId, upiName, amount, transactionId, note }) => {
  const cleanUpiId = (upiId || 'harishanbai06-2@oksbi').trim();
  const cleanName = (upiName || 'Vaseegrah Veda Catering').trim();
  const cleanAmount = Number(amount).toFixed(2);
  const cleanTxnId = (transactionId || generateTxnId()).trim();
  const cleanNote = (note || `Smart Lunch Meal Payment - ${cleanTxnId}`).trim();

  // Standard NPCI UPI URI: upi://pay?pa=...&pn=...&am=...&cu=INR&tr=...&tn=...
  return `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(cleanName)}&am=${cleanAmount}&cu=INR&tr=${encodeURIComponent(cleanTxnId)}&tn=${encodeURIComponent(cleanNote)}`;
};

/**
 * GET /api/payments
 * Retrieve payment history logs
 */
export const getPayments = async (req, res) => {
  try {
    const userUid = req.headers['x-user-uid'] || req.query.uid || '';
    const userEmail = req.headers['x-user-email'] || req.query.email || '';
    const includePending = req.query.includePending === 'true';

    let filter = {};
    if (!includePending) {
      filter.status = { $in: ['SUCCESS', 'Success'] };
    }

    if (userUid) {
      filter.$and = [
        filter.status ? { status: filter.status } : {},
        { $or: [{ userUid }, { userEmail: userEmail ? userEmail.toLowerCase() : '' }, { userUid: '' }, { userUid: null }] }
      ];
      delete filter.status;
    }

    const payments = await Payment.find(filter).sort({ paidAt: -1, createdAt: -1 }).limit(50);

    const formatted = payments.map(p => ({
      _id: p._id,
      id: p.transactionId,
      transactionId: p.transactionId,
      referenceNo: p.referenceNo || p.transactionId,
      desc: p.description,
      description: p.description,
      amount: p.amount,
      currency: p.currency || 'INR',
      type: p.paymentType,
      paymentType: p.paymentType,
      status: p.status || 'SUCCESS',
      paidAt: p.paidAt || p.createdAt,
      date: new Date(p.paidAt || p.createdAt).toLocaleDateString(),
      time: new Date(p.paidAt || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
 * POST /api/payments/order
 * Initiates an active QR payment session / order with status WAITING_FOR_PAYMENT
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const {
      amount,
      description,
      desc,
      upiId = 'harishanbai06-2@oksbi',
      upiName = 'Vaseegrah Veda Catering',
      referenceNo
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

    let userDoc = null;
    if (userUid) {
      userDoc = await User.findOne({ uid: userUid });
    } else if (userEmail) {
      userDoc = await User.findOne({ email: userEmail.toLowerCase() });
    }

    const transactionId = referenceNo && referenceNo.trim().length >= 4
      ? referenceNo.trim()
      : generateTxnId();

    const finalDesc = description || desc || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);

    // Expiry: 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    let payment = await Payment.findOne({ transactionId });
    if (!payment) {
      payment = new Payment({
        transactionId,
        referenceNo: transactionId,
        userId: userDoc ? userDoc._id : null,
        userUid: userUid || (userDoc ? userDoc.uid : ''),
        userEmail: userEmail || (userDoc ? userDoc.email : ''),
        description: finalDesc,
        amount: parsedAmount,
        currency: 'INR',
        paymentType: 'UPI',
        status: 'WAITING_FOR_PAYMENT',
        upiId: upiId.trim(),
        upiName: upiName.trim(),
        expiresAt
      });
      await payment.save();
    } else {
      if (payment.status === 'WAITING_FOR_PAYMENT' || payment.status === 'CREATED') {
        payment.amount = parsedAmount;
        payment.description = finalDesc;
        payment.upiId = upiId.trim();
        payment.upiName = upiName.trim();
        payment.expiresAt = expiresAt;
        await payment.save();
      }
    }

    const upiUri = buildUpiUri({
      upiId: payment.upiId,
      upiName: payment.upiName,
      amount: payment.amount,
      transactionId: payment.transactionId,
      note: payment.description
    });

    console.log(`[Payment] Order initiated: ${payment.transactionId} for ₹${payment.amount} (Status: ${payment.status})`);

    return res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        transactionId: payment.transactionId,
        referenceNo: payment.referenceNo,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        upiId: payment.upiId,
        upiName: payment.upiName,
        upiUri,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * GET /api/payments/status/:transactionId
 * Check real-time payment status by transaction ID
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({
      $or: [{ transactionId }, { referenceNo: transactionId }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        message: 'Payment transaction not found'
      });
    }

    // Check expiry if still waiting
    if (payment.status === 'WAITING_FOR_PAYMENT' && payment.expiresAt && new Date() > payment.expiresAt) {
      payment.status = 'EXPIRED';
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        id: payment.transactionId,
        transactionId: payment.transactionId,
        referenceNo: payment.referenceNo,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        status: payment.status,
        paidAt: payment.paidAt,
        date: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : null,
        time: payment.paidAt ? new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        description: payment.description,
        desc: payment.description,
        paymentType: payment.paymentType,
        upiId: payment.upiId,
        upiName: payment.upiName
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
};

/**
 * POST /api/payments/verify-active
 * Server-side payment verification and confirmation
 */
export const verifyActivePayment = async (req, res) => {
  try {
    const { amount, referenceNo, transactionId, description, upiId, upiName } = req.body;
    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount for verification'
      });
    }

    const txnId = (referenceNo || transactionId || '').trim();
    if (!txnId || txnId.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'A valid transaction reference ID is required for verification'
      });
    }

    const desc = description || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);

    let payment = await Payment.findOne({
      $or: [{ transactionId: txnId }, { referenceNo: txnId }]
    });

    if (payment) {
      // Validate payment amount & currency
      if (Math.abs(payment.amount - parsedAmount) > 0.01) {
        console.warn(`[Payment] Verification amount mismatch: expected ₹${payment.amount}, received ₹${parsedAmount}`);
        return res.status(400).json({
          success: false,
          message: `Amount mismatch. Expected ₹${payment.amount}, but received ₹${parsedAmount}`
        });
      }

      payment.status = 'SUCCESS';
      payment.paidAt = new Date();
      payment.description = desc;
      if (upiId) payment.upiId = upiId;
      if (upiName) payment.upiName = upiName;
      await payment.save();
    } else {
      payment = new Payment({
        transactionId: txnId,
        referenceNo: txnId,
        description: desc,
        amount: parsedAmount,
        currency: 'INR',
        paymentType: 'UPI',
        status: 'SUCCESS',
        upiId: upiId || 'harishanbai06-2@oksbi',
        upiName: upiName || 'Vaseegrah Veda Catering',
        paidAt: new Date()
      });
      await payment.save();
    }

    console.log(`[Payment] Payment verified successfully: ${payment.transactionId} (₹${payment.amount})`);

    const formatted = {
      _id: payment._id,
      id: payment.transactionId,
      transactionId: payment.transactionId,
      referenceNo: payment.referenceNo,
      desc: payment.description,
      description: payment.description,
      amount: payment.amount,
      currency: payment.currency || 'INR',
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
      message: 'Payment verified and recorded successfully',
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
 * POST /api/payments
 * Record a manual or settled payment transaction
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

    let userDoc = null;
    if (userUid) {
      userDoc = await User.findOne({ uid: userUid });
    } else if (userEmail) {
      userDoc = await User.findOne({ email: userEmail.toLowerCase() });
    }

    let transactionId = referenceNo ? referenceNo.trim() : '';
    if (!transactionId || transactionId.length < 4) {
      transactionId = generateTxnId();
    } else {
      const existing = await Payment.findOne({ transactionId });
      if (existing && existing.status === 'SUCCESS') {
        transactionId = `${transactionId}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const finalDesc = description || desc || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);
    const finalType = paymentType || type || 'UPI';

    let payment = await Payment.findOne({ transactionId });
    if (!payment) {
      payment = new Payment({
        transactionId,
        referenceNo: referenceNo || transactionId,
        userId: userDoc ? userDoc._id : null,
        userUid: userUid || (userDoc ? userDoc.uid : ''),
        userEmail: userEmail || (userDoc ? userDoc.email : ''),
        description: finalDesc,
        amount: parsedAmount,
        currency: 'INR',
        paymentType: finalType,
        status: status || 'SUCCESS',
        upiId: upiId || 'harishanbai06-2@oksbi',
        upiName: upiName || 'Vaseegrah Veda Catering',
        bankName: bankName || 'State Bank of India',
        paidAt: status === 'SUCCESS' ? new Date() : null
      });
      await payment.save();
    } else {
      payment.status = status || 'SUCCESS';
      payment.paidAt = status === 'SUCCESS' ? new Date() : payment.paidAt;
      payment.amount = parsedAmount;
      payment.description = finalDesc;
      if (upiId) payment.upiId = upiId;
      if (upiName) payment.upiName = upiName;
      if (bankName) payment.bankName = bankName;
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
      currency: payment.currency || 'INR',
      type: payment.paymentType,
      paymentType: payment.paymentType,
      status: payment.status,
      paidAt: payment.paidAt,
      date: new Date(payment.paidAt || payment.createdAt).toLocaleDateString(),
      time: new Date(payment.paidAt || payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upiId: payment.upiId,
      upiName: payment.upiName,
      bankName: payment.bankName
    };

    console.log(`[Payment] Payment recorded: ${payment.transactionId} (₹${payment.amount}, Status: ${payment.status})`);

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: formatted
    });
  } catch (error) {
    console.error('Error creating payment record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment transaction',
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
      payload.referenceNo ||
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

    let payment = await Payment.findOne({
      $or: [{ transactionId: txnId }, { referenceNo: txnId }]
    });

    if (!payment) {
      payment = new Payment({
        transactionId: txnId,
        referenceNo: txnId,
        description: desc,
        amount: amount,
        currency: payload.currency || 'INR',
        paymentType: payload.paymentType || 'UPI',
        status: status,
        upiId: payload.upiId || 'harishanbai06-2@oksbi',
        upiName: payload.upiName || 'Vaseegrah Veda Catering',
        bankName: payload.bankName || 'State Bank of India',
        paidAt: status === 'SUCCESS' ? new Date() : null
      });
      await payment.save();
    } else {
      payment.status = status;
      if (status === 'SUCCESS') payment.paidAt = new Date();
      await payment.save();
    }

    console.log(`[Payment Webhook] Updated transaction ${txnId} to ${status}`);

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
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
 * Simulates bank payment arrival for an active QR transaction ID
 */
export const simulatePayment = async (req, res) => {
  try {
    const { amount = 120, referenceNo, transactionId, description, upiId, upiName } = req.body;
    const parsedAmount = Number(amount) || 120;
    const txnId = (transactionId || referenceNo || generateTxnId()).trim();
    const desc = description || (parsedAmount === 120 ? 'Daily Lunch Subscription' : `Dynamic Meal Payment - ₹${parsedAmount}`);

    let payment = await Payment.findOne({
      $or: [{ transactionId: txnId }, { referenceNo: txnId }]
    });

    if (!payment) {
      payment = new Payment({
        transactionId: txnId,
        referenceNo: txnId,
        description: desc,
        amount: parsedAmount,
        currency: 'INR',
        paymentType: 'UPI',
        status: 'SUCCESS',
        upiId: upiId || 'harishanbai06-2@oksbi',
        upiName: upiName || 'Vaseegrah Veda Catering',
        paidAt: new Date()
      });
      await payment.save();
    } else {
      payment.status = 'SUCCESS';
      payment.paidAt = new Date();
      payment.amount = parsedAmount;
      payment.description = desc;
      await payment.save();
    }

    console.log(`[Payment] Simulated bank payment callback processed for: ${payment.transactionId}`);

    const formatted = {
      _id: payment._id,
      id: payment.transactionId,
      transactionId: payment.transactionId,
      referenceNo: payment.referenceNo,
      desc: payment.description,
      description: payment.description,
      amount: payment.amount,
      currency: payment.currency || 'INR',
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
      message: 'Simulated payment detected and confirmed',
      data: formatted
    });
  } catch (error) {
    console.error('Error simulating payment:', error);
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
