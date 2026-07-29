import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    default: null
  },
  vegFoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    default: null
  },
  nonVegFoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    default: null
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'skipped'],
    default: 'active'
  },
  generationType: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  // Smart Rule Engine fields (optional, backwards-compatible)
  ruleApplied: {
    type: String,
    default: 'Normal Random'
  },
  ruleCode: {
    type: String,
    enum: ['festival', 'viratham', 'amavasai', 'pournami', 'wednesday', 'normal'],
    default: 'normal'
  },
  tamilCalendarSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

// Compound index to ensure only one active menu per day if desired, or we just manage it in controller.
// Since skip replaces the menu item, we can have multiple records of menus for the same date (with status 'skipped'), but only one 'active' at a time.
// Let's create an index on date and status.
menuSchema.index({ date: 1, status: 1 });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
