import mongoose from 'mongoose';

const dailyRequirementSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    mealNumber: {
      type: Number,
      default: null
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null
    },
    dishName: {
      type: String,
      required: true,
      default: 'Lunch Menu'
    },
    dishNameTa: {
      type: String,
      default: ''
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg'],
      default: 'veg'
    },
    actualEmployees: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },
    basePersons: {
      type: Number,
      required: true,
      default: 10
    },
    groceryItems: [
      {
        name: { type: String, required: true },
        name_ta: { type: String, default: '' },
        baseQty: { type: Number, required: true },
        unit: { type: String, required: true },
        requiredQty: { type: Number, required: true },
        currentStorage: { type: Number, default: 0 },
        storageUnit: { type: String, default: '' },
        purchaseNeeded: { type: Number, default: 0 },
        remainingStock: { type: Number, default: 0 }
      }
    ],
    freshItems: [
      {
        name: { type: String, required: true },
        name_ta: { type: String, default: '' },
        baseQty: { type: Number, required: true },
        unit: { type: String, required: true },
        requiredQty: { type: Number, required: true },
        currentStorage: { type: Number, default: 0 },
        storageUnit: { type: String, default: '' },
        purchaseNeeded: { type: Number, default: 0 },
        remainingStock: { type: Number, default: 0 }
      }
    ],
    isStockDeducted: {
      type: Boolean,
      default: false
    },
    deductedEmployees: {
      type: Number,
      default: 0
    },
    deductedMealNumber: {
      type: Number,
      default: null
    },
    deductedAt: {
      type: Date,
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

dailyRequirementSchema.index({ date: 1 }, { unique: true });

const DailyRequirement = mongoose.models.DailyRequirement || mongoose.model('DailyRequirement', dailyRequirementSchema);

export default DailyRequirement;
