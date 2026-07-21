/**
 * menuGenerator.js
 *
 * Responsible for selecting an appropriate food item from the database
 * given a rule result from the Rule Engine.
 *
 * Responsibilities:
 *   - Exclude foods served in the previous 5 days
 *   - Exclude foods already skipped or active for the target date
 *   - Filter by allowed category (veg / non-veg / any)
 *   - Select a random food from candidates
 *   - Return the selected Food document (or throw a descriptive error)
 */

import Food from '../models/Food.js';
import Menu from '../models/Menu.js';

/**
 * Determines if a food's category matches the allowed category constraint.
 *
 * "Non-Veg" detection: category string contains "non" (case-insensitive)
 * e.g. "Non-Veg", "Non Veg", "NonVeg" all match.
 *
 * @param {string} category - Food category string from DB
 * @param {'veg'|'non-veg'|'any'} allowedCategory
 * @returns {boolean}
 */
const categoryMatches = (food, allowedCategory) => {
  if (allowedCategory === 'any') return true;
  let isNonVeg = false;
  if (food && food.foodType) {
    isNonVeg = food.foodType === 'non-veg';
  } else {
    const lower = (food?.category || '').toLowerCase();
    isNonVeg = lower.includes('non');
  }
  if (allowedCategory === 'non-veg') return isNonVeg;
  if (allowedCategory === 'veg')     return !isNonVeg;
  return true;
};

/**
 * Gets the date strings for the previous N days relative to a target date.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - Number of previous days to include
 * @returns {string[]}
 */
const getPreviousDates = (dateStr, days = 5) => {
  const target = new Date(dateStr);
  const result = [];
  for (let i = 1; i <= days; i++) {
    const prev = new Date(target);
    prev.setDate(target.getDate() - i);
    const yyyy = prev.getFullYear();
    const mm = String(prev.getMonth() + 1).padStart(2, '0');
    const dd = String(prev.getDate()).padStart(2, '0');
    result.push(`${yyyy}-${mm}-${dd}`);
  }
  return result;
};

/**
 * Selects a food item for the given date respecting rule constraints.
 *
 * Selection strategy:
 *   Pass 1: Available foods, not in 5-day history, matching category
 *   Pass 2: If no Pass-1 candidates → relax 5-day history, keep category filter
 *   Pass 3: If still none → relax history AND skip exclusions, keep category filter
 *   Error:  If category filter finds zero available foods → throw category-specific error
 *
 * @param {string} dateStr        - Target date YYYY-MM-DD
 * @param {Object} ruleResult     - Output from ruleEngine.evaluateRule()
 * @param {string[]} [extraSkips] - Additional food IDs to exclude (beyond DB records)
 * @returns {Promise<Object>} Selected Food mongoose document
 * @throws {Error} When no foods are available for the required category
 */
export const selectFood = async (dateStr, ruleResult, extraSkips = []) => {
  const { allowedCategory, ruleCode } = ruleResult;

  // ── Collect exclusions ────────────────────────────────────────────────────

  // 5-day history exclusions
  const prevDates = getPreviousDates(dateStr, 5);
  const recentMenus = await Menu.find({
    date: { $in: prevDates },
    status: 'active',
  }).select('foodId');
  const historyIds = recentMenus.map((m) => m.foodId.toString());

  // Already generated (active or skipped) for target date
  const todayMenus = await Menu.find({ date: dateStr }).select('foodId');
  const todayIds = todayMenus.map((m) => m.foodId.toString());

  const allSkippedIds = Array.from(new Set([...todayIds, ...extraSkips.map(String)]));
  const fullExclusion = Array.from(new Set([...historyIds, ...allSkippedIds]));

  // ── Base food query (always: available = true) ────────────────────────────
  const baseFilter = { available: true };

  // ── Pass 1: Full exclusions + category filter ─────────────────────────────
  let candidates = await Food.find({
    ...baseFilter,
    _id: { $nin: fullExclusion },
  });
  candidates = candidates.filter((f) => categoryMatches(f, allowedCategory));

  // ── Pass 2: Relax 5-day history, keep today's skips + category filter ─────
  if (candidates.length === 0) {
    console.warn(`[MenuGenerator] No candidates with 5-day rule for ${dateStr}. Relaxing history.`);
    candidates = await Food.find({
      ...baseFilter,
      _id: { $nin: allSkippedIds },
    });
    candidates = candidates.filter((f) => categoryMatches(f, allowedCategory));
  }

  // ── Pass 3: Relax everything, keep only category filter ───────────────────
  if (candidates.length === 0) {
    console.warn(`[MenuGenerator] Still no candidates for ${dateStr}. Relaxing all exclusions.`);
    candidates = await Food.find(baseFilter);
    candidates = candidates.filter((f) => categoryMatches(f, allowedCategory));
  }

  // ── No foods found for the required category ──────────────────────────────
  if (candidates.length === 0) {
    const categoryLabel =
      allowedCategory === 'non-veg' ? 'Non-Veg' :
      allowedCategory === 'veg'     ? 'Vegetarian' :
      'available';

    throw Object.assign(
      new Error(`No ${categoryLabel} foods are currently available.`),
      { ruleCode, allowedCategory, code: 'NO_CATEGORY_FOODS' }
    );
  }

  // ── Random selection ──────────────────────────────────────────────────────
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selected = candidates[randomIndex];

  console.log(`[MenuGenerator] Selected "${selected.name}" (${selected.category}) for ${dateStr} — rule: ${ruleCode}`);
  return selected;
};
