import Menu from '../models/Menu.js';
import Food from '../models/Food.js';
import Holiday from '../models/Holiday.js';
import { generateLunchForDate } from '../services/generatorService.js';
import { selectFood } from '../services/menuGenerator.js';
import { translateResponse } from '../utils/translator.js';
import { getKolkataDateStr, getCurrentISTHour } from '../utils/dateUtils.js';

// Fallback date helper if import is not ready
const getTodayStr = () => {
  try {
    return getKolkataDateStr(0);
  } catch (err) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

const getTomorrowStr = () => {
  try {
    return getKolkataDateStr(1);
  } catch (err) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

export const getTodayMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const todayStr = getTodayStr();

    const holiday = await Holiday.findOne({ date: todayStr, status: 'HOLIDAY' });
    if (holiday) {
      return res.json({
        date: todayStr,
        isHoliday: true,
        holiday: translateResponse(holiday, lang),
        status: 'holiday'
      });
    }

    let menu = await Menu.findOne({ date: todayStr, status: 'active' })
      .populate('foodId', '-image.data')
      .populate('vegFoodId', '-image.data')
      .populate('nonVegFoodId', '-image.data');

    if (!menu) {
      try {
        menu = await generateLunchForDate(todayStr, 'automatic', { scheduledTime: '20:00' });
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

    const holiday = await Holiday.findOne({ date: tomorrowStr, status: 'HOLIDAY' });
    if (holiday) {
      return res.json({
        date: tomorrowStr,
        isHoliday: true,
        holiday: translateResponse(holiday, lang),
        status: 'holiday'
      });
    }

    let menu = await Menu.findOne({ date: tomorrowStr, status: 'active' })
      .populate('foodId', '-image.data')
      .populate('vegFoodId', '-image.data')
      .populate('nonVegFoodId', '-image.data');

    if (!menu) {
      // If it is >= 8:00 PM IST (20:00 IST), auto-recover tomorrow's scheduled menu
      const istHour = getCurrentISTHour();
      if (istHour >= 20) {
        try {
          menu = await generateLunchForDate(tomorrowStr, 'automatic', { scheduledTime: '20:00' });
        } catch (err) {
          return res.status(200).json(null);
        }
      } else {
        return res.status(200).json(null);
      }
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

    const holiday = await Holiday.findOne({ date: tomorrowStr, status: 'HOLIDAY' });
    if (holiday) {
      return res.status(400).json({ message: "Tomorrow is marked as a holiday. Remove holiday to generate menu." });
    }

    const menu = await generateLunchForDate(tomorrowStr, 'manual');
    res.status(201).json(translateResponse(menu, lang));
  } catch (error) {
    if (error.code === 'NO_ELIGIBLE_FOODS' || error.code === 'NO_CATEGORY_FOODS') {
      return res.status(409).json({
        message: error.message,
        ruleCode: error.ruleCode,
        allowedCategory: error.allowedCategory,
        code: error.code || 'NO_ELIGIBLE_FOODS',
      });
    }
    res.status(500).json({ message: "Error generating tomorrow's menu", error: error.message });
  }
};

export const skipTomorrowMenu = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const tomorrowStr = getTomorrowStr();

    const activeMenu = await Menu.findOne({ date: tomorrowStr, status: 'active' });
    if (!activeMenu) {
      return res.status(400).json({ message: "No active tomorrow's menu exists to skip." });
    }

    activeMenu.status = 'skipped';
    await activeMenu.save();

    const newMenu = await generateLunchForDate(tomorrowStr, 'manual');
    res.json(translateResponse(newMenu, lang));
  } catch (error) {
    if (error.code === 'NO_ELIGIBLE_FOODS' || error.code === 'NO_CATEGORY_FOODS') {
      return res.status(409).json({
        message: error.message,
        ruleCode: error.ruleCode,
        allowedCategory: error.allowedCategory,
        code: error.code || 'NO_ELIGIBLE_FOODS',
      });
    }
    res.status(500).json({ message: "Error skipping menu item", error: error.message });
  }
};

export const getMenuHistory = async (req, res) => {
  try {
    const { month, search } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    let query = { status: 'active' };

    if (month) {
      query.date = { $regex: `^${month}` };
    }

    let menus = await Menu.find(query)
      .populate('foodId', '-image.data')
      .populate('vegFoodId', '-image.data')
      .populate('nonVegFoodId', '-image.data')
      .sort({ date: -1 });

    // Fetch active holidays for the requested period
    const holidayQuery = { status: 'HOLIDAY' };
    if (month) {
      holidayQuery.date = { $regex: `^${month}` };
    }
    const holidays = await Holiday.find(holidayQuery).lean();

    const holidayRecords = holidays.map(h => ({
      _id: h._id,
      date: h.date,
      isHoliday: true,
      holiday: h,
      name: h.name || 'Holiday',
      name_ta: h.name_ta || 'விடுமுறை',
      notes: h.notes || '',
      generatedAt: h.updatedAt || h.createdAt || new Date(h.date),
      status: 'holiday'
    }));

    // Avoid duplicate entries: if a date is marked as a holiday, the holiday record represents that date
    const holidayDates = new Set(holidays.map(h => h.date));
    const activeMenus = menus.filter(m => !holidayDates.has(m.date));

    let combined = [...activeMenus, ...holidayRecords];

    if (search) {
      const searchLower = search.toLowerCase();
      combined = combined.filter(item => {
        if (item.isHoliday) {
          return (
            'holiday'.includes(searchLower) ||
            'விடுமுறை'.includes(searchLower) ||
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.name_ta && item.name_ta.toLowerCase().includes(searchLower)) ||
            (item.notes && item.notes.toLowerCase().includes(searchLower))
          );
        }
        const matchesSearch = (food) => {
          if (!food) return false;
          return (
            food.name.toLowerCase().includes(searchLower) ||
            (food.name_ta && food.name_ta.toLowerCase().includes(searchLower)) ||
            food.category.toLowerCase().includes(searchLower)
          );
        };
        return matchesSearch(item.foodId) || matchesSearch(item.vegFoodId) || matchesSearch(item.nonVegFoodId);
      });
    }

    // Sort chronologically descending
    combined.sort((a, b) => b.date.localeCompare(a.date));

    res.json(translateResponse(combined, lang));
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

    let menu = await Menu.findOne({ date, status: 'active' });

    if (menu) {
      menu.foodId = foodId;
      menu.vegFoodId = isNonVeg ? null : foodId;
      menu.nonVegFoodId = isNonVeg ? foodId : null;
      menu.generationType = 'manual';
      menu.scheduledTime = null;
      await menu.save();
    } else {
      menu = new Menu({
        date,
        foodId,
        vegFoodId: isNonVeg ? null : foodId,
        nonVegFoodId: isNonVeg ? foodId : null,
        status: 'active',
        generationType: 'manual',
        scheduledTime: null
      });
      await menu.save();
    }

    const populated = await Menu.findById(menu._id)
      .populate('foodId', '-image.data')
      .populate('vegFoodId', '-image.data')
      .populate('nonVegFoodId', '-image.data');

    res.status(201).json(translateResponse(populated, lang));
  } catch (error) {
    res.status(500).json({ message: "Error assigning menu item", error: error.message });
  }
};

export const deleteMenuRecord = async (req, res) => {
  try {
    const { id } = req.params;

    let menu = await Menu.findByIdAndDelete(id);
    if (!menu) {
      const holiday = await Holiday.findByIdAndDelete(id);
      if (holiday) {
        return res.json({ message: "Holiday record deleted successfully" });
      }
      return res.status(404).json({ message: "Menu or Holiday record not found" });
    }
    res.json({ message: "Menu record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu record", error: error.message });
  }
};
