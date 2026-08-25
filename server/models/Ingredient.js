import mongoose from 'mongoose';
import { normalizeIngredientName } from '../utils/ingredientNormalizer.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    name_ta: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['grocery', 'fresh'],
      required: true,
      default: 'grocery'
    },
    defaultUnit: {
      type: String,
      required: true,
      trim: true,
      default: 'kg'
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0
    },
    suggestedStorageStock: {
      type: Number,
      default: 0,
      min: 0
    },
    isStorageItem: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ingredientSchema.pre('validate', function () {
  if (this.name && !this.normalizedName) {
    this.normalizedName = normalizeIngredientName(this.name);
  }
});

ingredientSchema.index({ category: 1, isStorageItem: 1 });

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;
