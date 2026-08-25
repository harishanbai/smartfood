import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    ingredientName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['usage_deduction', 'stock_addition', 'manual_adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    referenceDate: {
      type: String,
      default: null
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

stockTransactionSchema.index({ ingredientId: 1, createdAt: -1 });

const StockTransaction = mongoose.models.StockTransaction || mongoose.model('StockTransaction', stockTransactionSchema);

export default StockTransaction;
