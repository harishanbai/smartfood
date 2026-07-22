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
    type: String,
    default: ''
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

const Food = mongoose.model('Food', foodSchema);
export default Food;

