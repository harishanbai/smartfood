import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  baseQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'g'
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    default: null
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema(
  {
    mealNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 28
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    name_ta: {
      type: String,
      required: true,
      trim: true
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg'],
      default: 'veg'
    },
    category: {
      type: String,
      default: 'Main Course'
    },
    description: {
      type: String,
      default: ''
    },
    basePersons: {
      type: Number,
      default: 10,
      required: true
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      default: null
    },
    ingredients: [recipeIngredientSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

recipeSchema.index({ name: 'text', name_ta: 'text' });

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

export default Recipe;
