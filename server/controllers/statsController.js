import Food from '../models/Food.js';
import Menu from '../models/Menu.js';
import { mockDb } from '../services/mockDbService.js';

export const getStats = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const stats = mockDb.getStats();
      return res.json(stats);
    }

    const totalFoods = await Food.countDocuments();
    const availableFoods = await Food.countDocuments({ available: true });
    const unavailableFoods = await Food.countDocuments({ available: false });
    const menusGenerated = await Menu.countDocuments({ status: 'active' });
    const menusSkipped = await Menu.countDocuments({ status: 'skipped' });

    // Find the most generated food item (active status)
    const mostGeneratedAggregation = await Menu.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$foodId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let mostGeneratedFood = null;
    if (mostGeneratedAggregation.length > 0) {
      const food = await Food.findById(mostGeneratedAggregation[0]._id);
      if (food) {
        mostGeneratedFood = {
          name: food.name,
          category: food.category,
          image: food.image,
          count: mostGeneratedAggregation[0].count
        };
      }
    }

    // Also get counts by category for charts
    const categoryAggregation = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryStats = categoryAggregation.map(item => ({
      name: item._id,
      value: item.count
    }));

    // Get weekly generation statistics (last 7 menus)
    const recentMenus = await Menu.find({ status: 'active' })
      .populate('foodId')
      .sort({ date: -1 })
      .limit(7);
    
    const weeklyStats = recentMenus.map(menu => ({
      date: menu.date,
      food: menu.foodId ? menu.foodId.name : 'Unknown'
    })).reverse();

    res.json({
      totalFoods,
      availableFoods,
      unavailableFoods,
      menusGenerated,
      menusSkipped,
      mostGeneratedFood,
      categoryStats,
      weeklyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
  }
};
