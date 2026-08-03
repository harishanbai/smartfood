/**
 * generatorService.js
 *
 * Orchestrates Tomorrow's Lunch Menu generation:
 *   1. Fetch Tamil Calendar data for the target date
 *   2. Evaluate business rules (Rule Engine)
 *   3. Select EXACTLY ONE food item (Menu Generator) obeying 15-day history & availability
 *   4. Persist the single food menu to MongoDB
 *
 * Single Entry Point for Menu Generation.
 */

import Menu from '../models/Menu.js';
import { getCalendarData } from './tamilCalendarService.js';
import { evaluateRule } from './ruleEngine.js';
import { selectFood } from './menuGenerator.js';

/**
 * Generates EXACTLY ONE lunch menu item for the given target date.
 *
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @param {'automatic'|'manual'|'AUTO'} generationType - Generation source
 * @param {Object} [options] - Additional options
 * @param {string|null} [options.scheduledTime] - Scheduled time string e.g. '20:00' for cron runs
 * @returns {Promise<Object>} Populated Menu mongoose document
 */
export const generateLunchForDate = async (dateStr, generationType = 'automatic', options = {}) => {
  const { scheduledTime = null } = options;

  // 1. Fetch Tamil Calendar Data
  const tamilData = await getCalendarData(dateStr);

  // 2. Evaluate Rule Engine
  const ruleResult = evaluateRule(tamilData, dateStr);

  console.log(`[GeneratorService] Target: ${dateStr} | Rule: "${ruleResult.ruleApplied}" | Category: ${ruleResult.allowedCategory}`);

  // 3. Select EXACTLY ONE food item obeying 15-day history and availability
  const selectedFood = await selectFood(dateStr, ruleResult);

  // 4. Mark any existing active menu for that target date as 'skipped'
  await Menu.updateMany(
    { date: dateStr, status: 'active' },
    { status: 'skipped' }
  );

  // 5. Save new Menu document with EXACTLY ONE food item
  const isNonVeg = selectedFood.foodType === 'non-veg';
  const newMenu = new Menu({
    date: dateStr,
    foodId: selectedFood._id,
    vegFoodId: isNonVeg ? null : selectedFood._id,
    nonVegFoodId: isNonVeg ? selectedFood._id : null,
    generatedAt: new Date(),
    status: 'active',
    generationType,
    scheduledTime,
    ruleApplied: ruleResult.ruleApplied,
    ruleCode: ruleResult.ruleCode,
    tamilCalendarSnapshot: tamilData,
  });

  await newMenu.save();

  // 6. Populate and return
  const populated = await Menu.findById(newMenu._id)
    .populate('foodId', '-image.data')
    .populate('vegFoodId', '-image.data')
    .populate('nonVegFoodId', '-image.data');

  console.log(`[GeneratorService] Single Menu generated for ${dateStr}: "${selectedFood.name}" (${generationType})`);
  return populated;
};
