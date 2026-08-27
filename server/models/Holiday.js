import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      default: 'Holiday'
    },
    name_ta: {
      type: String,
      default: 'விடுமுறை'
    },
    status: {
      type: String,
      enum: ['HOLIDAY', 'WORKING_DAY'],
      default: 'HOLIDAY'
    },
    markedBy: {
      type: String,
      default: 'user'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema);

export default Holiday;
