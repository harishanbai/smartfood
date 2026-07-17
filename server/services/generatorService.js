import Food from '../models/Food.js';
import Menu from '../models/Menu.js';

/**
 * Generates tomorrow's lunch or any date's lunch following rules:
 * - Pick only available foods.
 * - Never repeat foods served in the previous 5 days.
 * - Never pick the same food twice during one generation (skipped foods for that date are excluded).
 * 
 * @param {string} dateStr - The target date in YYYY-MM-DD format
 * @returns {Promise<Object>} The generated Menu document populated with Food details
 */
export const generateLunchForDate = async (dateStr) => {
  // 1. Get the list of dates for the previous 5 days
  const targetDate = new Date(dateStr);
  const previousDates = [];
  for (let i = 1; i <= 5; i++) {
    const prevDate = new Date(targetDate);
    prevDate.setDate(targetDate.getDate() - i);
    const yyyy = prevDate.getFullYear();
    const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dd = String(prevDate.getDate()).padStart(2, '0');
    previousDates.push(`${yyyy}-${mm}-${dd}`);
  }

  // 2. Find food IDs served in the previous 5 days (status must be 'active')
  const recentMenus = await Menu.find({
    date: { $in: previousDates },
    status: 'active'
  }).select('foodId');
  const excludedFoodIds = recentMenus.map(m => m.foodId.toString());

  // 3. Find food IDs already generated (active or skipped) for the target date to prevent repeats
  const todayMenus = await Menu.find({ date: dateStr }).select('foodId');
  const skippedOrActiveTodayIds = todayMenus.map(m => m.foodId.toString());

  // Merge exclusions
  const allExcludedIds = Array.from(new Set([...excludedFoodIds, ...skippedOrActiveTodayIds]));

  // 4. Query available foods that are NOT in the excluded list
  let candidateFoods = await Food.find({
    available: true,
    _id: { $nin: allExcludedIds }
  });

  // Fallback: If no candidate foods are available due to strict 5-day rule or skips,
  // we reset the 5-day exclusion rule and only respect the skips for today.
  if (candidateFoods.length === 0) {
    console.warn(`No foods available for ${dateStr} with 5-day history constraint. Relaxing history rule.`);
    candidateFoods = await Food.find({
      available: true,
      _id: { $nin: skippedOrActiveTodayIds }
    });
  }

  // Fallback 2: If we still don't have foods (e.g. everything is skipped or there are no foods),
  // we look for any available food at all, or return null.
  if (candidateFoods.length === 0) {
    candidateFoods = await Food.find({ available: true });
  }

  if (candidateFoods.length === 0) {
    throw new Error('No available food items found in the database. Please add or mark food items as available first.');
  }

  // 5. Select a random food
  const randomIndex = Math.floor(Math.random() * candidateFoods.length);
  const selectedFood = candidateFoods[randomIndex];

  // 6. If there is an existing 'active' menu for this date, mark it as 'skipped'
  await Menu.updateMany({ date: dateStr, status: 'active' }, { status: 'skipped' });

  // 7. Save the new menu item
  const newMenu = new Menu({
    date: dateStr,
    foodId: selectedFood._id,
    generatedAt: new Date(),
    status: 'active'
  });

  await newMenu.save();

  // Populate food details and return
  return await Menu.findById(newMenu._id).populate('foodId');
};
