import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'skipped'],
    default: 'active'
  }
});

// Compound index to ensure only one active menu per day if desired, or we just manage it in controller.
// Since skip replaces the menu item, we can have multiple records of menus for the same date (with status 'skipped'), but only one 'active' at a time.
// Let's create an index on date and status.
menuSchema.index({ date: 1, status: 1 });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
