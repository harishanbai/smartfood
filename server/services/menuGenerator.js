/**
 * menuGenerator.js
 *
 * Responsible for selecting an appropriate food item from the database
 * given a rule result from the Rule Engine.
 *
 * Requirements:
 *   - Exclude foods served in the previous 15 days (MongoDB history)
 *   - Select ONLY foods that are marked as available: true
 *   - If no eligible foods remain due to 15-day restriction, log a warning and do not repeat
 *   - Filter by allowed category (veg / non-veg / any)
 *   - Select randomly EXACTLY ONE food item
 */

import Food from '../models/Food.js';
import Menu from '../models/Menu.js';

/**
 * Gets date strings for the previous N days relative to a target date.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - Number of previous days to include (default 15)
 * @returns {string[]}
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
 * Determines if a food's category matches the allowed category constraint.
 */
const categoryMatches = (food, allowedCategory) => {
  if (!allowedCategory || allowedCategory === 'any') return true;
  const isNonVeg = food.foodType === 'non-veg' || (food.category || '').toLowerCase().includes('non');
  if (allowedCategory === 'non-veg') return isNonVeg;
  if (allowedCategory === 'veg') return !isNonVeg;
  return true;
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
  const { allowedCategory = 'any', ruleCode = 'normal' } = ruleResult;

  // 1. Fetch previous 15-day history from MongoDB
  const prev15Dates = getPreviousDates(dateStr, 15);
  const recentMenus = await Menu.find({
    date: { $in: prev15Dates },
    status: 'active'
  }).select('foodId vegFoodId nonVegFoodId');

  const historyIds = [];
  recentMenus.forEach(m => {
    if (m.foodId) historyIds.push(m.foodId.toString());
    if (m.vegFoodId) historyIds.push(m.vegFoodId.toString());
    if (m.nonVegFoodId) historyIds.push(m.nonVegFoodId.toString());
  });

  // 2. Fetch skipped items for the target date
  const todayMenus = await Menu.find({ date: dateStr, status: 'skipped' }).select('foodId vegFoodId nonVegFoodId');
  const skippedIds = [];
  todayMenus.forEach(m => {
    if (m.foodId) skippedIds.push(m.foodId.toString());
    if (m.vegFoodId) skippedIds.push(m.vegFoodId.toString());
    if (m.nonVegFoodId) skippedIds.push(m.nonVegFoodId.toString());
  });

  // Combine 15-day history + skipped IDs + extra skips
  const fullExclusion = Array.from(new Set([...historyIds, ...skippedIds, ...extraSkips.map(String)]));

  // 3. Base Query: Only Available Foods
  const baseFilter = { available: true };

  // 4. Query Available Foods excluding 15-day history
  let candidates = await Food.find({
    ...baseFilter,
    _id: { $nin: fullExclusion }
  });

  // Apply category filter (Veg / Non-Veg / Any)
  candidates = candidates.filter(f => categoryMatches(f, allowedCategory));

  // 5. If no candidates exist under 15-day restriction
  if (candidates.length === 0) {
    console.warn(`[MenuGenerator] WARNING: No eligible foods available for ${dateStr}. All available foods were served in the previous 15 days or restricted by category rules (${allowedCategory}).`);
    
    throw Object.assign(
      new Error(`No eligible foods available for menu generation. All available foods were served within the previous 15 days or do not match rule constraints (${allowedCategory}).`),
      { code: 'NO_ELIGIBLE_FOODS', allowedCategory, ruleCode }
    );
  }

  // 6. Randomly select EXACTLY ONE food item
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selectedFood = candidates[randomIndex];

  console.log(`[MenuGenerator] Selected EXACTLY ONE food: "${selectedFood.name}" (${selectedFood.category}) for ${dateStr} — Rule: ${ruleCode}`);
  return selectedFood;
};
