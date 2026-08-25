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
    paymentType: {
      type: String,
      enum: ['UPI', 'Bank', 'Card'],
      default: 'UPI'
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED', 'Success'],
      default: 'SUCCESS'
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
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
