import Menu from '../models/Menu.js';
import { generateLunchForDate } from '../services/generatorService.js';
import { mockDb } from '../services/mockDbService.js';

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

    if (process.env.USE_MOCK_DB === 'true') {
      let menu = mockDb.getToday();
      if (!menu) {
        try {
          menu = mockDb.generateLunchForDate(todayStr);
        } catch (err) {
          return res.status(200).json(null);
        }
      }
      return res.json(menu);
    }

    let menu = await Menu.findOne({ date: todayStr, status: 'active' }).populate('foodId');
    if (!menu) {
      try {
        menu = await generateLunchForDate(todayStr);
      } catch (err) {
        return res.status(200).json(null);
      }
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving today's menu", error: error.message });
  }
};

export const getTomorrowMenu = async (req, res) => {
  try {
    if (process.env.USE_MOCK_DB === 'true') {
      const menu = mockDb.getTomorrow();
      return res.json(menu);
    }

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

    if (process.env.USE_MOCK_DB === 'true') {
      const menu = mockDb.generateLunchForDate(tomorrowStr);
      return res.status(201).json(menu);
    }

    const menu = await generateLunchForDate(tomorrowStr);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error generating tomorrow's menu", error: error.message });
  }
};

export const skipTomorrowMenu = async (req, res) => {
  try {
    const tomorrowStr = getTomorrowStr();

    if (process.env.USE_MOCK_DB === 'true') {
      const newMenu = mockDb.skipTomorrow();
      return res.json(newMenu);
    }
    
    // Find active menu for tomorrow
    const activeMenu = await Menu.findOne({ date: tomorrowStr, status: 'active' });
    if (!activeMenu) {
      return res.status(400).json({ message: "No active tomorrow's menu exists to skip." });
    }

    // Mark current active menu as skipped
    activeMenu.status = 'skipped';
    await activeMenu.save();

    // Generate another random food for tomorrow (which automatically avoids current skips and recent history)
    const newMenu = await generateLunchForDate(tomorrowStr);
    res.json(newMenu);
  } catch (error) {
    res.status(500).json({ message: "Error skipping menu item", error: error.message });
  }
};

export const getMenuHistory = async (req, res) => {
  try {
    const { month, search } = req.query; // YYYY-MM

    if (process.env.USE_MOCK_DB === 'true') {
      const menus = mockDb.getHistory(month, search);
      return res.json(menus);
    }

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

export const assignMenu = async (req, res) => {
  try {
    const { date, foodId } = req.body;
    if (!date || !foodId) {
      return res.status(400).json({ message: "Date and foodId are required." });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const menu = mockDb.assignMenu(date, foodId);
      return res.status(201).json(menu);
    }

    // Deactivate existing active menus for this date
    await Menu.updateMany({ date, status: 'active' }, { status: 'skipped' });

    // Create new menu
    const menu = new Menu({
      date,
      foodId,
      status: 'active'
    });
    await menu.save();
    
    const populated = await Menu.findById(menu._id).populate('foodId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error assigning menu item", error: error.message });
  }
};
