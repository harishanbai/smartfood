import Menu from '../models/Menu.js';
import Food from '../models/Food.js';
import { generateLunchForDate } from '../services/generatorService.js';
import { selectFood } from '../services/menuGenerator.js';
import { translateResponse } from '../utils/translator.js';

// Date utility functions
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getTodayMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const todayStr = getTodayStr();

    let menu = await Menu.findOne({ date: todayStr, status: 'active' })
      .populate('foodId')
      .populate('vegFoodId')
      .populate('nonVegFoodId');
    if (!menu) {
      try {
        menu = await generateLunchForDate(todayStr, 'automatic');
      } catch (err) {
        return res.status(200).json(null);
      }
    }
    res.json(translateResponse(menu, lang));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving today's menu", error: error.message });
  }
};

export const getTomorrowMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const tomorrowStr = getTomorrowStr();
    const menu = await Menu.findOne({ date: tomorrowStr, status: 'active' })
      .populate('foodId')
      .populate('vegFoodId')
      .populate('nonVegFoodId');
    if (!menu) {
      return res.status(200).json(null);
    }
    res.json(translateResponse(menu, lang));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tomorrow's menu", error: error.message });
  }
};

export const generateTomorrowMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const tomorrowStr = getTomorrowStr();

    const menu = await generateLunchForDate(tomorrowStr, 'manual');
    res.status(201).json(translateResponse(menu, lang));
  } catch (error) {
    // Typed error: no foods available for the required category (e.g. No Non-Veg on Wednesday)
    if (error.code === 'NO_CATEGORY_FOODS') {
      return res.status(409).json({
        message: error.message,
        ruleCode: error.ruleCode,
        allowedCategory: error.allowedCategory,
        code: 'NO_CATEGORY_FOODS',
      });
    }
    res.status(500).json({ message: "Error generating tomorrow's menu", error: error.message });
  }
};

export const skipTomorrowMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const tomorrowStr = getTomorrowStr();

    // Find active menu for tomorrow
    const activeMenu = await Menu.findOne({ date: tomorrowStr, status: 'active' });
    if (!activeMenu) {
      return res.status(400).json({ message: "No active tomorrow's menu exists to skip." });
    }

    // Mark current active menu as skipped
    activeMenu.status = 'skipped';
    await activeMenu.save();

    // Generate another food for tomorrow — inherits the same Rule Engine category constraint
    const newMenu = await generateLunchForDate(tomorrowStr, 'manual');
    res.json(translateResponse(newMenu, lang));
  } catch (error) {
    // Typed error: no more foods available for the required category after skipping
    if (error.code === 'NO_CATEGORY_FOODS') {
      return res.status(409).json({
        message: error.message,
        ruleCode: error.ruleCode,
        allowedCategory: error.allowedCategory,
        code: 'NO_CATEGORY_FOODS',
      });
    }
    res.status(500).json({ message: "Error skipping menu item", error: error.message });
  }
};

export const getMenuHistory = async (req, res) => {
  try {
    const { month, search } = req.query; // YYYY-MM
    const lang = req.headers['accept-language'] || 'en';

    let query = { status: 'active' };

    if (month) {
      query.date = { $regex: `^${month}` }; // Matches e.g. "2026-07"
    }

    let menus = await Menu.find(query)
      .populate('foodId')
      .populate('vegFoodId')
      .populate('nonVegFoodId')
      .sort({ date: -1 });

    // Filter by search query on food name or category if present
    if (search) {
      const searchLower = search.toLowerCase();
      menus = menus.filter(m => {
        const matchesSearch = (food) => {
          if (!food) return false;
          return (
            food.name.toLowerCase().includes(searchLower) ||
            (food.name_ta && food.name_ta.toLowerCase().includes(searchLower)) ||
            food.category.toLowerCase().includes(searchLower)
          );
        };
        return matchesSearch(m.foodId) || matchesSearch(m.vegFoodId) || matchesSearch(m.nonVegFoodId);
      });
    }

    res.json(translateResponse(menus, lang));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving menu history", error: error.message });
  }
};

export const assignMenu = async (req, res) => {
  try {
    const { date, foodId } = req.body;
    const lang = req.headers['accept-language'] || 'en';
    if (!date || !foodId) {
      return res.status(400).json({ message: "Date and foodId are required." });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found." });
    }

    const isNonVeg = food.foodType === 'non-veg';

    // Find if there is already an active menu for this date
    let menu = await Menu.findOne({ date, status: 'active' });

    if (menu) {
      // Update the correct slot
      if (isNonVeg) {
        menu.nonVegFoodId = foodId;
      } else {
        menu.vegFoodId = foodId;
        menu.foodId = foodId; // backward compatibility
      }
      menu.generationType = 'manual';
      await menu.save();
    } else {
      // Create new menu
      menu = new Menu({
        date,
        foodId: isNonVeg ? null : foodId,
        vegFoodId: isNonVeg ? null : foodId,
        nonVegFoodId: isNonVeg ? foodId : null,
        status: 'active',
        generationType: 'manual'
      });
      // If we assigned a non-veg food but have no veg food, auto-assign a fallback veg food
      if (isNonVeg) {
        try {
          const defaultVeg = await selectFood(date, { allowedCategory: 'veg' });
          menu.vegFoodId = defaultVeg._id;
          menu.foodId = defaultVeg._id;
        } catch (err) {
          console.warn('[AssignMenu] Could not auto-assign a fallback veg food:', err.message);
        }
      }
      await menu.save();
    }

    const populated = await Menu.findById(menu._id)
      .populate('foodId')
      .populate('vegFoodId')
      .populate('nonVegFoodId');

    res.status(201).json(translateResponse(populated, lang));
  } catch (error) {
    res.status(500).json({ message: "Error assigning menu item", error: error.message });
  }
};

export const deleteMenuRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu record not found" });
    }
    res.json({ message: "Menu record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu record", error: error.message });
  }
};
