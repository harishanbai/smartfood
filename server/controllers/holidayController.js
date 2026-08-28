import Holiday from '../models/Holiday.js';
import { translateResponse } from '../utils/translator.js';
import { getKolkataDateStr, getCurrentISTHour } from '../utils/dateUtils.js';

/**
 * GET /api/holidays
 * Get all holidays or filter by ?month=YYYY-MM or ?date=YYYY-MM-DD
 */
export const getHolidays = async (req, res) => {
  try {
    const { month, date } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    const query = { status: 'HOLIDAY' };

    if (date) {
      query.date = date;
    } else if (month) {
      query.date = { $regex: `^${month}` };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json(translateResponse(holidays, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving holidays', error: error.message });
  }
};

/**
 * GET /api/holidays/check?date=YYYY-MM-DD
 * Check holiday status for a specific date
 */
export const checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const holiday = await Holiday.findOne({ date, status: 'HOLIDAY' });
    res.json({
      date,
      isHoliday: !!holiday,
      holiday: holiday ? translateResponse(holiday, lang) : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking holiday status', error: error.message });
  }
};

/**
 * POST /api/holidays
 * Mark a date as a Holiday
 */
export const markHoliday = async (req, res) => {
  try {
    const { date, name = 'Holiday', name_ta = 'விடுமுறை', notes = '' } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const holiday = await Holiday.findOneAndUpdate(
      { date },
      {
        date,
        name: name || 'Holiday',
        name_ta: name_ta || 'விடுமுறை',
        status: 'HOLIDAY',
        notes: notes || ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: 'Date marked as holiday successfully',
      holiday: translateResponse(holiday, lang)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking holiday', error: error.message });
  }
};

/**
 * DELETE /api/holidays/:date or POST /api/holidays/remove
 * Remove holiday status for a date (only permitted if lunch has not passed yet)
 */
export const removeHoliday = async (req, res) => {
  try {
    const date = req.params.date || req.body.date;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // 1:00 PM (13:00) lunch cutoff check:
    // Past dates or today after 1:00 PM cannot have their holiday status removed
    const todayStr = getKolkataDateStr(0);
    const currentHour = getCurrentISTHour();

    if (date < todayStr || (date === todayStr && currentHour >= 13)) {
      return res.status(400).json({
        message: 'Cannot remove holiday for a past or completed lunch date (1:00 PM cutoff).'
      });
    }

    const deleted = await Holiday.findOneAndDelete({ date });

    if (!deleted) {
      return res.status(404).json({ message: 'Holiday not found for the specified date' });
    }

    res.json({
      message: 'Holiday removed successfully. Normal working day restored.',
      date
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing holiday', error: error.message });
  }
};
