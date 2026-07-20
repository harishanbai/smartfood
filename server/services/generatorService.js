/**
 * generatorService.js
 *
 * Orchestrates the Smart Lunch Generator pipeline:
 *   1. Fetch Tamil Calendar data for the target date
 *   2. Evaluate business rules (Rule Engine)
 *   3. Select an appropriate food item (Menu Generator)
 *   4. Persist the menu to MongoDB with rule metadata
 *
 * This service is the single entry point for menu generation.
 * All business logic lives in the dedicated sub-services.
 */

import Menu from '../models/Menu.js';
import { getCalendarData } from './tamilCalendarService.js';
import { evaluateRule } from './ruleEngine.js';
import { selectFood } from './menuGenerator.js';

/**
 * Generates a lunch menu for the given date using the Smart Rule Engine.
 *
 * Steps:
 *  1. Fetch Tamil calendar data (cached per day, null on API failure)
 *  2. Evaluate rule priority → get allowedCategory + ruleApplied
 *  3. Select food obeying: available=true, 5-day history, category filter
 *  4. Mark any existing active menu for that date as 'skipped'
 *  5. Save new Menu document with rule metadata
 *  6. Return populated Menu document
 *
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @returns {Promise<Object>} Populated Menu mongoose document
 * @throws {Error} If no suitable food is available
 */
export const generateLunchForDate = async (dateStr) => {
  // ── Step 1: Tamil Calendar Data ──────────────────────────────────────────
  // Returns null on API failure; rule engine treats null as "Normal Day"
  const tamilData = await getCalendarData(dateStr);

  // ── Step 2: Rule Engine ───────────────────────────────────────────────────
  const ruleResult = evaluateRule(tamilData, dateStr);

  console.log(`[GeneratorService] Rule for ${dateStr}: "${ruleResult.ruleApplied}" | Category: ${ruleResult.allowedCategory}`);

  // ── Step 3: Select Food ───────────────────────────────────────────────────
  // selectFood throws a typed error if no foods available for the category
  const selectedFood = await selectFood(dateStr, ruleResult);

  // ── Step 4: Mark existing active menu as skipped ──────────────────────────
  await Menu.updateMany(
    { date: dateStr, status: 'active' },
    { status: 'skipped' }
  );

  // ── Step 5: Save new menu with rule metadata ──────────────────────────────
  const newMenu = new Menu({
    date: dateStr,
    foodId: selectedFood._id,
    generatedAt: new Date(),
    status: 'active',
    ruleApplied: ruleResult.ruleApplied,
    ruleCode: ruleResult.ruleCode,
    tamilCalendarSnapshot: tamilData,
  });

  await newMenu.save();

  // ── Step 6: Populate and return ───────────────────────────────────────────
  const populated = await Menu.findById(newMenu._id).populate('foodId');
  console.log(`[GeneratorService] Menu saved: "${selectedFood.name}" for ${dateStr}`);
  return populated;
};
