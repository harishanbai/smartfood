import mongoose from 'mongoose';

const whatsAppLogSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      index: true
    },
    phone: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['accepted', 'sent', 'delivered', 'read', 'failed'],
      default: 'accepted',
      index: true
    },
    failureReason: {
      type: String,
      default: ''
    },
    errorCode: {
      type: Number,
      default: null
    },
    templateName: {
      type: String,
      default: ''
    },
    rawStatusEvent: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const WhatsAppLog = mongoose.models.WhatsAppLog || mongoose.model('WhatsAppLog', whatsAppLogSchema);

export default WhatsAppLog;
