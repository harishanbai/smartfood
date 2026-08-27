import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    referenceNo: {
      type: String,
      default: '',
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userUid: {
      type: String,
      default: '',
      trim: true
    },
    userEmail: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      required: true,
      default: 'Daily Lunch Subscription',
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true
    },
    paymentType: {
      type: String,
      enum: ['UPI', 'Bank', 'Card'],
      default: 'UPI'
    },
    status: {
      type: String,
      enum: ['CREATED', 'WAITING_FOR_PAYMENT', 'VERIFYING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED', 'PENDING', 'Success'],
      default: 'WAITING_FOR_PAYMENT'
    },
    upiId: {
      type: String,
      default: ''
    },
    upiName: {
      type: String,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Performance Indexes
paymentSchema.index({ userUid: 1, paidAt: -1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
