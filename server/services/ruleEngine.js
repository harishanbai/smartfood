/**
 * ruleEngine.js
 *
 * Pure business rule evaluator for the Smart Lunch Generator.
 * Determines which food category is allowed for a given date
 * based on Tamil Calendar / Panchangam data and company rules.
 *
 * Rule Priority (highest to lowest):
 *   1. RELIGIOUS OBSERVANCES (Festival, Amavasai, Pournami, Viratham)
 *      → STRICT VEGETARIAN ONLY — overrides ALL other rules including Wednesday
 *   2. WEDNESDAY SPECIAL RULE
 *      → NON-VEGETARIAN prioritized (only if no religious observance)
 *   3. NORMAL DAY
 *      → Full menu unlocked (Veg & Non-Veg allowed, random pick)
 *
 * Output shape (all rule types):
 *   ruleType       - NORMAL | FESTIVAL | AMAVASAI | POURNAMI | VIRATHAM
 *   badgeTitle     - UI badge string (with emoji prefix)
 *   isStrictVeg    - Boolean: force veg-only mode
 *   isStrictNonVeg - Boolean: Wednesday forces non-veg preference
 *   allowNonVeg    - Boolean: are non-veg items permitted at all?
 *   uiDescription  - Human-readable explanation for the rule
 *   recommendedTags - Tags to prioritise in food selection
 *   [legacy props] - allowedCategory, ruleApplied, ruleCode, reason, festivalName
 */

const WEDNESDAY = 3; // JS Date.getDay() → 0=Sun, 3=Wed

/**
 * Returns the JS Date.getDay() index for the given YYYY-MM-DD string.
 * Parsed manually to avoid timezone issues.
 * @param {string} dateStr
 * @returns {number}
 */
const getDayOfWeek = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
};

/**
 * Evaluates all business rules and returns the complete rule result object.
 *
 * @param {Object|null} tamilData - Normalised Tamil calendar data
 * @param {string} dateStr        - Target date YYYY-MM-DD
 * @returns {Object} RuleResult
 */
export const evaluateRule = (tamilData, dateStr) => {
  const dayIndex = getDayOfWeek(dateStr);

  // ─── PRIORITY 1A: Festival ────────────────────────────────────────────────
  if (tamilData?.isFestival === true || tamilData?.festivalName) {
    const festivalName = tamilData.festivalName || 'Tamil Festival';
    return {
      ruleType: 'FESTIVAL',
      badgeTitle: `🎉 ${festivalName} Special`,
      isStrictVeg: true,
      isStrictNonVeg: false,
      allowNonVeg: false,
      uiDescription: `Strict Veg rule active for ${festivalName}. Non-veg items strictly excluded. Traditional festive thali items prioritized.`,
      recommendedTags: ['FestiveSpecial', 'Sattvic'],
      // Legacy compatibility
      allowedCategory: 'veg',
      ruleApplied: `🎉 ${festivalName} Special`,
      ruleCode: 'festival',
      reason: `Strict Veg rule active for ${festivalName}. Non-veg items strictly excluded. Traditional festive thali items prioritized.`,
      festivalName,
    };
  }

  // ─── PRIORITY 1B: Viratham (Fasting Day) ─────────────────────────────────
  if (tamilData?.isViratham === true || tamilData?.virathamName) {
    const virathamName = tamilData.virathamName || 'Auspicious';
    return {
      ruleType: 'VIRATHAM',
      badgeTitle: `🪔 ${virathamName} Viratham`,
      isStrictVeg: true,
      isStrictNonVeg: false,
      allowNonVeg: false,
      uiDescription: 'Auspicious Viratham day. Non-vegetarian dishes disabled. Light and Sattvic menu active.',
      recommendedTags: ['Sattvic'],
      // Legacy compatibility
      allowedCategory: 'veg',
      ruleApplied: `🪔 ${virathamName} Viratham`,
      ruleCode: 'viratham',
      reason: 'Auspicious Viratham day. Non-vegetarian dishes disabled.',
      festivalName: null,
      virathamName,
    };
  }

  // ─── PRIORITY 1C: Amavasai (New Moon) ────────────────────────────────────
  if (tamilData?.isAmavasai === true) {
    return {
      ruleType: 'AMAVASAI',
      badgeTitle: '🌑 Amavasai Special',
      isStrictVeg: true,
      isStrictNonVeg: false,
      allowNonVeg: false,
      uiDescription: 'Strict Veg rule active for Amavasai. Non-veg items strictly excluded.',
      recommendedTags: ['Sattvic', 'NoOnionNoGarlic'],
      // Legacy compatibility
      allowedCategory: 'veg',
      ruleApplied: '🌑 Amavasai Special',
      ruleCode: 'amavasai',
      reason: 'Strict Veg rule active for Amavasai. Non-veg items strictly excluded.',
      festivalName: null,
    };
  }

  // ─── PRIORITY 1D: Pournami (Full Moon) ───────────────────────────────────
  if (tamilData?.isPournami === true) {
    return {
      ruleType: 'POURNAMI',
      badgeTitle: '🌕 Pournami Special',
      isStrictVeg: true,
      isStrictNonVeg: false,
      allowNonVeg: false,
      uiDescription: 'Strict Veg rule active for Pournami. Non-veg items strictly excluded.',
      recommendedTags: ['Sattvic'],
      // Legacy compatibility
      allowedCategory: 'veg',
      ruleApplied: '🌕 Pournami Special',
      ruleCode: 'pournami',
      reason: 'Strict Veg rule active for Pournami. Non-veg items strictly excluded.',
      festivalName: null,
    };
  }

  // ─── PRIORITY 2: Wednesday Non-Veg Rule ──────────────────────────────────
  // Only applies when NO religious observance is active
  if (dayIndex === WEDNESDAY) {
    return {
      ruleType: 'NORMAL',
      badgeTitle: '🍗 Wednesday Non-Veg Special',
      isStrictVeg: false,
      isStrictNonVeg: true,
      allowNonVeg: true,
      uiDescription: 'Wednesday Routine: Non-vegetarian menu prioritized today.',
      recommendedTags: ['NonVeg'],
      // Legacy compatibility
      allowedCategory: 'non-veg',
      ruleApplied: '🍗 Wednesday Non-Veg Special',
      ruleCode: 'wednesday',
      reason: 'Wednesday Routine: Non-vegetarian menu prioritized today.',
      festivalName: null,
    };
  }

  // ─── PRIORITY 3: Normal Day ───────────────────────────────────────────────
  return {
    ruleType: 'NORMAL',
    badgeTitle: '🎲 Normal Day',
    isStrictVeg: false,
    isStrictNonVeg: false,
    allowNonVeg: true,
    uiDescription: 'No religious fasting or weekly rules today. Full recipe pool active.',
    recommendedTags: [],
    // Legacy compatibility
    allowedCategory: 'any',
    ruleApplied: '🎲 Normal Day',
    ruleCode: 'normal',
    reason: 'No religious fasting or weekly rules today. Full recipe pool active.',
    festivalName: null,
  };
};

/**
 * Returns the display label for a rule code.
 * @param {string} ruleCode
 * @returns {string}
 */
export const getRuleLabel = (ruleCode) => {
  const labels = {
    festival:  'Festival – Strict Veg Only',
    viratham:  'Viratham – Strict Veg Only',
    amavasai:  'Amavasai – Strict Veg Only',
    pournami:  'Pournami – Strict Veg Only',
    wednesday: 'Wednesday – Non-Veg Special',
    normal:    'Normal Day – Full Menu',
  };
  return labels[ruleCode] || 'Normal Day – Full Menu';
};
