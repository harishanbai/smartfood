/**
 * tamilCalendarController.js
 *
 * Exposes Tamil Calendar data and current Rule Engine evaluation
 * to the frontend WITHOUT leaking the API key.
 *
 * Routes:
 *   GET /api/tamil-calendar/today    → today's Tamil data + rule evaluation
 *   GET /api/tamil-calendar/tomorrow → tomorrow's Tamil data + rule evaluation
 */

import { getCalendarData } from '../services/tamilCalendarService.js';
import { evaluateRule } from '../services/ruleEngine.js';

/**
 * Formats a JS Date to YYYY-MM-DD string.
 * @param {Date} d
 * @returns {string}
 */
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Builds a combined response with Tamil data + rule evaluation.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<Object>}
 */
const buildCalendarResponse = async (dateStr) => {
  const tamilData = await getCalendarData(dateStr);
  const ruleResult = evaluateRule(tamilData, dateStr);

  return {
    date: dateStr,
    tamilCalendar: tamilData,
    rule: {
      ruleApplied: ruleResult.ruleApplied,
      ruleCode: ruleResult.ruleCode,
      allowedCategory: ruleResult.allowedCategory,
      reason: ruleResult.reason,
      festivalName: ruleResult.festivalName || null,
    },
    apiAvailable: tamilData !== null,
  };
};

/**
 * GET /api/tamil-calendar/today
 */
export const getTodayCalendar = async (req, res) => {
  try {
    const todayStr = toDateStr(new Date());
    const result = await buildCalendarResponse(todayStr);
    res.json(result);
  } catch (error) {
    console.error('[TamilCalendarController] Error fetching today:', error.message);
    res.status(500).json({
      message: 'Error fetching Tamil calendar data for today',
      error: error.message,
    });
  }
};

/**
 * GET /api/tamil-calendar/tomorrow
 */
export const getTomorrowCalendar = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);
    const result = await buildCalendarResponse(tomorrowStr);
    res.json(result);
  } catch (error) {
    console.error('[TamilCalendarController] Error fetching tomorrow:', error.message);
    res.status(500).json({
      message: 'Error fetching Tamil calendar data for tomorrow',
      error: error.message,
    });
  }
};
