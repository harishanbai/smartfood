/**
 * dateUtils.js
 * Utility functions for date formatting and timezone handling (Asia/Kolkata).
 */

/**
 * Formats a date as YYYY-MM-DD in Asia/Kolkata timezone with optional day offset.
 * @param {number} offsetDays - Days to add/subtract (0 for today, 1 for tomorrow)
 * @param {Date} [baseDate] - Optional base date (defaults to current date)
 * @returns {string} YYYY-MM-DD string
 */
export const getKolkataDateStr = (offsetDays = 0, baseDate = new Date()) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
};
