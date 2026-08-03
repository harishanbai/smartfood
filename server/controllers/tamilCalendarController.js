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
import { translateResponse } from '../utils/translator.js';
import { getKolkataDateStr } from '../utils/dateUtils.js';

/**
 * Builds a combined response with Tamil data + rule evaluation.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} lang - Requested language
 * @returns {Promise<Object>}
 */
const buildCalendarResponse = async (dateStr, lang = 'en') => {
  const tamilData = await getCalendarData(dateStr);
  const ruleResult = evaluateRule(tamilData, dateStr);

  const response = {
    date: dateStr,
    tamilCalendar: tamilData,
    rule: {
      ...ruleResult,
      festivalName: ruleResult.festivalName || null,
    },
    apiAvailable: tamilData !== null,
  };

  return translateResponse(response, lang);
};

/**
 * GET /api/tamil-calendar/today
 */
export const getTodayCalendar = async (req, res) => {
  try {
    const todayStr = getKolkataDateStr(0);
    const lang = req.headers['accept-language'] || 'en';
    console.log(`[TamilCalendarController] 📅 API Date Requested (Today): ${todayStr}`);
    const result = await buildCalendarResponse(todayStr, lang);
    console.log(`[TamilCalendarController] Festival Today (${todayStr}):`, result?.tamilCalendar?.festivalName || (result?.tamilCalendar?.isFestival ? 'Festival' : 'None'));
    console.log(`[TamilCalendarController] Today API Response:`, JSON.stringify(result));
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
    const tomorrowStr = getKolkataDateStr(1);
    const lang = req.headers['accept-language'] || 'en';
    console.log(`[TamilCalendarController] 📅 API Date Requested (Tomorrow): ${tomorrowStr}`);
    const result = await buildCalendarResponse(tomorrowStr, lang);
    console.log(`[TamilCalendarController] Festival Tomorrow (${tomorrowStr}):`, result?.tamilCalendar?.festivalName || (result?.tamilCalendar?.isFestival ? 'Festival' : 'None'));
    console.log(`[TamilCalendarController] Tomorrow API Response:`, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    console.error('[TamilCalendarController] Error fetching tomorrow:', error.message);
    res.status(500).json({
      message: 'Error fetching Tamil calendar data for tomorrow',
      error: error.message,
    });
  }
};
