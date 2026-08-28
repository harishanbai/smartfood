/**
 * dateUtils.js
 * Utility functions for date and lunch cutoff calculations.
 */

/**
 * Determines whether lunch for a given date has passed (1:00 PM cutoff).
 * - Past dates (< today): true (lunch has passed)
 * - Today (>= 13:00): true (lunch has passed)
 * - Today (< 13:00): false (lunch has not passed)
 * - Future dates (> today): false (lunch has not passed)
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {Date} [baseDate] - Current date/time (default new Date())
 * @returns {boolean}
 */
export const isLunchPast = (dateStr, baseDate = new Date()) => {
  if (!dateStr) return false;

  const now = new Date(baseDate);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (dateStr < todayStr) {
    return true; // Past date
  }

  if (dateStr === todayStr) {
    // 1:00 PM is 13:00 (13 hours)
    const hours = now.getHours();
    return hours >= 13;
  }

  return false; // Future date
};

/**
 * Checks if Holiday removal or lunch editing is permitted for a date.
 * Permitted only if lunch for that date has not passed yet.
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {Date} [baseDate] - Current date/time
 * @returns {boolean}
 */
export const canRemoveHoliday = (dateStr, baseDate = new Date()) => {
  return !isLunchPast(dateStr, baseDate);
};
