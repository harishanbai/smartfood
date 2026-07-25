/**
 * menuGenerator.js
 *
 * Responsible for selecting an appropriate food item from the database
 * given a rule result from the Rule Engine.
 *
 * Selection Strategy:
 *   1. Exclude foods served in the previous 15 days (MongoDB history)
 *   2. Exclude foods marked as available: false
 *   3. Apply category filter from rule engine:
 *      - FESTIVAL / VIRATHAM / AMAVASAI / POURNAMI → VEG ONLY
 *        └─ If any "FestiveSpecial" tagged / Special-category dishes exist, prioritize them
 *      - WEDNESDAY → NON-VEG preferred, but veg allowed as fallback
 *        └─ If non-veg dishes exist, select from them; else fall back to any available
 *      - NORMAL → Any (random from all available eligible foods)
 *   4. Select EXACTLY ONE food item randomly from filtered candidates
 */

import Food from '../models/Food.js';
import Menu from '../models/Menu.js';

/**
 * Festive dish name keywords — these are prioritized on religious observance days.
 */
const FESTIVE_KEYWORDS = [
  'pongal', 'sundal', 'kozhukattai', 'payasam', 'vada', 'medu',
  'sakkarai', 'elaneer', 'modak', 'prasad', 'idli', 'dosa',
  'chutney', 'sambar', 'rasam', 'avial', 'olan', 'thoran'
];

/**
 * Non-veg dish name keywords — prioritized on Wednesday.
 */
const NON_VEG_KEYWORDS = [
  'chicken', 'mutton', 'fish', 'prawn', 'egg', 'crab', 'lamb',
  'biryani', 'kebab', 'tikka', 'keema', 'salmon', 'seafood', 'wings'
];

/**
 * Returns whether a food item is vegetarian.
 */
const isVegFood = (food) => {
  if (food.foodType) return food.foodType === 'veg';
  const name = (food.name || '').toLowerCase();
  const cat  = (food.category || '').toLowerCase();
  return !NON_VEG_KEYWORDS.some(kw => name.includes(kw) || cat.includes(kw));
};

/**
 * Returns whether a food item is non-vegetarian.
 */
const isNonVegFood = (food) => !isVegFood(food);

/**
 * Returns whether a food item is a "festive special" dish.
 */
const isFestiveSpecial = (food) => {
  const name = (food.name || '').toLowerCase();
  const cat  = (food.category || '').toLowerCase();
  return FESTIVE_KEYWORDS.some(kw => name.includes(kw))
    || cat === 'special';
};

/**
 * Gets date strings for the previous N days relative to a target date.
 */
const getPreviousDates = (dateStr, days = 15) => {
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
 * Selects exactly ONE eligible food item for the target date.
 *
 * @param {string} dateStr - Target date YYYY-MM-DD
 * @param {Object} ruleResult - Output from ruleEngine.evaluateRule()
 * @param {string[]} [extraSkips] - Additional food IDs to exclude
 * @returns {Promise<Object>} Selected Food document
 */
export const selectFood = async (dateStr, ruleResult = {}, extraSkips = []) => {
  const {
    allowedCategory = 'any',
    ruleCode        = 'normal',
    isStrictVeg     = false,
    isStrictNonVeg  = false,
  } = ruleResult;

  // 1. Build 15-day history exclusion list
  const prev15Dates = getPreviousDates(dateStr, 15);
  const recentMenus = await Menu.find({
    date: { $in: prev15Dates },
    status: 'active'
  }).select('foodId vegFoodId nonVegFoodId');

  const historyIds = new Set();
  recentMenus.forEach(m => {
    if (m.foodId)       historyIds.add(m.foodId.toString());
    if (m.vegFoodId)    historyIds.add(m.vegFoodId.toString());
    if (m.nonVegFoodId) historyIds.add(m.nonVegFoodId.toString());
  });

  // 2. Build skipped IDs for today
  const todayMenus = await Menu.find({ date: dateStr, status: 'skipped' })
    .select('foodId vegFoodId nonVegFoodId');
  const skippedIds = new Set();
  todayMenus.forEach(m => {
    if (m.foodId)       skippedIds.add(m.foodId.toString());
    if (m.vegFoodId)    skippedIds.add(m.vegFoodId.toString());
    if (m.nonVegFoodId) skippedIds.add(m.nonVegFoodId.toString());
  });

  const fullExclusion = Array.from(new Set([
    ...historyIds,
    ...skippedIds,
    ...extraSkips.map(String)
  ]));

  // 3. Fetch all available foods excluding history
  let candidates = await Food.find({
    available: true,
    _id: { $nin: fullExclusion }
  });

  // 4. Apply category filter
  if (isStrictVeg || allowedCategory === 'veg') {
    candidates = candidates.filter(isVegFood);
  } else if (allowedCategory === 'non-veg') {
    candidates = candidates.filter(isNonVegFood);
  }
  // else 'any' → keep all

  // 5. Festival / Viratham / Amavasai / Pournami: prefer festive-tagged dishes
  if (isStrictVeg) {
    const festivePool = candidates.filter(isFestiveSpecial);
    if (festivePool.length > 0) {
      console.log(`[MenuGenerator] ${ruleCode.toUpperCase()} day — Festive pool (${festivePool.length} items) preferred.`);
      candidates = festivePool;
    } else {
      console.log(`[MenuGenerator] ${ruleCode.toUpperCase()} day — No festive items; falling back to full veg pool (${candidates.length} items).`);
    }
  }

  // 6. Wednesday: prefer non-veg; fall back if empty
  if (isStrictNonVeg && !isStrictVeg) {
    const nonVegPool = candidates.filter(isNonVegFood);
    if (nonVegPool.length > 0) {
      console.log(`[MenuGenerator] WEDNESDAY — Non-veg pool (${nonVegPool.length} items) preferred.`);
      candidates = nonVegPool;
    } else {
      // Widen to any available food if no non-veg exists (graceful degradation)
      console.warn('[MenuGenerator] WEDNESDAY — No non-veg foods available; falling back to full eligible pool.');
      // candidates remains unchanged (all available minus history)
    }
  }

  // 7. No candidates remaining
  if (candidates.length === 0) {
    console.warn(`[MenuGenerator] No eligible foods for ${dateStr} (rule: ${ruleCode}, allowedCategory: ${allowedCategory}). All foods served in last 15 days.`);
    throw Object.assign(
      new Error(`No eligible foods available for menu generation. All available foods matching rule constraints (${allowedCategory}) were served within the previous 15 days.`),
      { code: 'NO_ELIGIBLE_FOODS', allowedCategory, ruleCode }
    );
  }

  // 8. Select exactly ONE food randomly
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  console.log(`[MenuGenerator] Selected: "${selected.name}" (${selected.foodType || selected.category}) for ${dateStr} — Rule: ${ruleCode}`);
  return selected;
};
