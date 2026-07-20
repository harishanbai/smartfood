/**
 * ruleEngine.js
 *
 * Pure business rule evaluator for the Smart Lunch Generator.
 * Determines which food category is allowed for a given date
 * based on Tamil Calendar data and company rules.
 *
 * Rule Priority (highest to lowest):
 *   1. Tamil Festival  → Veg Only
 *   2. Amavasai        → Veg Only  (overrides Wednesday)
 *   3. Wednesday       → Non-Veg Only
 *   4. Normal Day      → Any (random Veg or Non-Veg)
 *
 * This module has ZERO side effects and can be unit-tested in isolation.
 */

/**
 * @typedef {Object} RuleResult
 * @property {'veg'|'non-veg'|'any'} allowedCategory - Category constraint for food selection
 * @property {string} ruleApplied                    - Human-readable rule name
 * @property {string} reason                          - Detailed reason for notification display
 * @property {'festival'|'amavasai'|'wednesday'|'normal'} ruleCode - Machine-readable code
 */

/**
 * Day-of-week index for Wednesday (JS Date.getDay() → 0=Sun, 3=Wed)
 */
const WEDNESDAY = 3;

/**
 * Returns the JS Date.getDay() index for the given YYYY-MM-DD string.
 * We parse manually to avoid timezone issues.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {number} 0 (Sun) to 6 (Sat)
 */
const getDayOfWeek = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
};

/**
 * Evaluates all business rules and returns the allowed food category.
 *
 * @param {Object|null} tamilData - Normalised Tamil calendar data (from tamilCalendarService)
 *                                  null means API unavailable → treat as normal day
 * @param {string} dateStr        - Target date in YYYY-MM-DD format
 * @returns {RuleResult}
 */
export const evaluateRule = (tamilData, dateStr) => {
  const dayIndex = getDayOfWeek(dateStr);

  // ─── Priority 1: Tamil Festival ───────────────────────────────────────────
  if (tamilData?.isFestival === true) {
    const festivalName = tamilData.festivalName || 'Tamil Festival';
    return {
      allowedCategory: 'veg',
      ruleApplied: 'Festival – Veg Only',
      reason: `🪔 ${festivalName} detected. Vegetarian menu selected.`,
      ruleCode: 'festival',
      festivalName,
    };
  }

  // ─── Priority 2: Amavasai (No Moon Day) ───────────────────────────────────
  // Overrides Wednesday Non-Veg rule
  if (tamilData?.isAmavasai === true) {
    return {
      allowedCategory: 'veg',
      ruleApplied: 'Amavasai – Veg Only',
      reason: '🌑 Amavasai detected. Vegetarian menu selected.',
      ruleCode: 'amavasai',
      festivalName: null,
    };
  }

  // ─── Priority 3: Wednesday Company Rule ───────────────────────────────────
  if (dayIndex === WEDNESDAY) {
    return {
      allowedCategory: 'non-veg',
      ruleApplied: 'Company Rule – Wednesday Non-Veg',
      reason: '🍗 Wednesday detected. Non-Veg menu generated.',
      ruleCode: 'wednesday',
      festivalName: null,
    };
  }

  // ─── Priority 4: Normal Day ────────────────────────────────────────────────
  return {
    allowedCategory: 'any',
    ruleApplied: 'Normal Random',
    reason: '🎲 Normal day. Random menu generated.',
    ruleCode: 'normal',
    festivalName: null,
  };
};

/**
 * Returns the display label for a rule code.
 * Used by the frontend for badge rendering.
 *
 * @param {string} ruleCode
 * @returns {string}
 */
export const getRuleLabel = (ruleCode) => {
  const labels = {
    festival:  'Festival – Veg Only',
    amavasai:  'Amavasai – Veg Only',
    wednesday: 'Company Rule – Wednesday Non-Veg',
    normal:    'Normal Random',
  };
  return labels[ruleCode] || 'Normal Random';
};
