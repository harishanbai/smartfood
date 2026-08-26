import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
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
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },

  image: {
    data: Buffer,
    contentType: String
  },
  available: {
    type: Boolean,
    default: true
  },
  foodType: {
    type: String,
    enum: ['veg', 'non-veg'],
    default: 'veg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Performance Indexes
foodSchema.index({ available: 1, foodType: 1 });
foodSchema.index({ createdAt: -1 });
foodSchema.index({ name: 1 });

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);
export default Food;
