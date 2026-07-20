import Menu from '../models/Menu.js';
import { generateLunchForDate } from '../services/generatorService.js';

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


    const todayStr = getTodayStr();
    const menu = await Menu.findOne({ date: todayStr, status: 'active' }).populate('foodId');
    if (!menu) {
      return res.status(200).json(null);
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving today's menu", error: error.message });
  }
};

export const getTomorrowMenu = async (req, res) => {
  try {


    const tomorrowStr = getTomorrowStr();
    const menu = await Menu.findOne({ date: tomorrowStr, status: 'active' }).populate('foodId');
    if (!menu) {
      return res.status(200).json(null);
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tomorrow's menu", error: error.message });
  }
};

export const generateTomorrowMenu = async (req, res) => {
  try {
    const tomorrowStr = getTomorrowStr();



    const menu = await generateLunchForDate(tomorrowStr);
    res.status(201).json(menu);
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
    const newMenu = await generateLunchForDate(tomorrowStr);
    res.json(newMenu);
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



    let query = { status: 'active' };

    if (month) {
      query.date = { $regex: `^${month}` }; // Matches e.g. "2026-07"
    }

    let menus = await Menu.find(query).populate('foodId').sort({ date: -1 });

    // Filter by search query on food name or category if present
    if (search) {
      const searchLower = search.toLowerCase();
      menus = menus.filter(m => {
        if (!m.foodId) return false;
        return (
          m.foodId.name.toLowerCase().includes(searchLower) ||
          m.foodId.category.toLowerCase().includes(searchLower)
        );
      });
    }

    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving menu history", error: error.message });
  }
};
