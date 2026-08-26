import Food from '../models/Food.js';
import Menu from '../models/Menu.js';
import { translateResponse } from '../utils/translator.js';

export const getStats = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    // Execute count, aggregation, and recent menu queries concurrently
    const [
      totalFoods,
      vegFoods,
      nonVegFoods,
      availableFoods,
      unavailableFoods,
      menusGenerated,
      menusSkipped,
      mostGeneratedAggregation,
      categoryAggregation,
      recentMenus
    ] = await Promise.all([
      Food.countDocuments(),
      Food.countDocuments({ foodType: 'veg' }),
      Food.countDocuments({ foodType: 'non-veg' }),
      Food.countDocuments({ available: true }),
      Food.countDocuments({ available: false }),
      Menu.countDocuments({ status: 'active' }),
      Menu.countDocuments({ status: 'skipped' }),
      Menu.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$foodId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      Food.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Menu.find({ status: 'active' })
        .populate('foodId', '-image.data')
        .sort({ date: -1 })
        .limit(7)
    ]);

    let mostGeneratedFood = null;
    if (mostGeneratedAggregation.length > 0 && mostGeneratedAggregation[0]._id) {
      const food = await Food.findById(mostGeneratedAggregation[0]._id).select('-image.data');
      if (food) {
        mostGeneratedFood = {
          _id: food._id,
          name: food.name,
          category: food.category,
          image: food.image,
          count: mostGeneratedAggregation[0].count
        };
      }
    }

    const categoryStats = categoryAggregation.map(item => ({
      name: item._id,
      value: item.count
    }));

    const weeklyStats = recentMenus.map(menu => ({
      date: menu.date,
      food: menu.foodId ? menu.foodId.name : 'Unknown'
    })).reverse();

    res.json(translateResponse({
      totalFoods,
      vegFoods,
      nonVegFoods,
      availableFoods,
      unavailableFoods,
      menusGenerated,
      menusSkipped,
      mostGeneratedFood,
      categoryStats,
      weeklyStats
    }, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
  }
};
