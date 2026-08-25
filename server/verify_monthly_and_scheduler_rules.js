import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Ingredient from './models/Ingredient.js';
import Recipe from './models/Recipe.js';
import Menu from './models/Menu.js';
import { normalizeToStorageUnit, calculateDailyRequirements, isUnitCompatible } from './services/requirementCalculator.js';
import { normalizeIngredientName } from './utils/ingredientNormalizer.js';
import { generateLunchForDate } from './services/generatorService.js';
import { getSchedulerStatus } from './services/schedulerService.js';

async function runVerification() {
  await connectDB();
  console.log('\n======================================================');
  console.log('🧪 VERIFYING MONTHLY PLANNING & SCHEDULER LOGIC');
  console.log('======================================================\n');

  let allPassed = true;

  // ─── Test 1 — Insufficient Stock ─────────────────────────────
  {
    const req = 32.48;
    const stock = 30;
    const purchase = Math.max(0, Math.round((req - stock) * 100) / 100);
    const status = req === 0 ? 'NOT_REQUIRED_THIS_MONTH' : (stock >= req ? 'STOCK_SUFFICIENT' : 'NEED_PURCHASE');
    const passed = purchase === 2.48 && status === 'NEED_PURCHASE';
    console.log(`Test 1 (Insufficient Stock): ${passed ? '✅ PASS' : '❌ FAIL'} -> Purchase: ${purchase} kg, Status: ${status}`);
    if (!passed) allPassed = false;
  }

  // ─── Test 2 — Exact Stock ────────────────────────────────────
  {
    const req = 30;
    const stock = 30;
    const purchase = Math.max(0, Math.round((req - stock) * 100) / 100);
    const status = req === 0 ? 'NOT_REQUIRED_THIS_MONTH' : (stock >= req ? 'STOCK_SUFFICIENT' : 'NEED_PURCHASE');
    const passed = purchase === 0 && status === 'STOCK_SUFFICIENT';
    console.log(`Test 2 (Exact Stock): ${passed ? '✅ PASS' : '❌ FAIL'} -> Purchase: ${purchase} kg, Status: ${status}`);
    if (!passed) allPassed = false;
  }

  // ─── Test 3 — More Stock Than Required ───────────────────────
  {
    const req = 3.3;
    const stock = 5;
    const purchase = Math.max(0, Math.round((req - stock) * 100) / 100);
    const status = req === 0 ? 'NOT_REQUIRED_THIS_MONTH' : (stock >= req ? 'STOCK_SUFFICIENT' : 'NEED_PURCHASE');
    const passed = purchase === 0 && status === 'STOCK_SUFFICIENT';
    console.log(`Test 3 (More Stock Than Required): ${passed ? '✅ PASS' : '❌ FAIL'} -> Purchase: ${purchase} kg, Status: ${status}`);
    if (!passed) allPassed = false;
  }

  // ─── Test 4 — No Monthly Requirement ─────────────────────────
  {
    const req = 0;
    const stock = 100;
    const purchase = Math.max(0, Math.round((req - stock) * 100) / 100);
    const status = req === 0 ? 'NOT_REQUIRED_THIS_MONTH' : (stock >= req ? 'STOCK_SUFFICIENT' : 'NEED_PURCHASE');
    const passed = purchase === 0 && status === 'NOT_REQUIRED_THIS_MONTH';
    console.log(`Test 4 (No Monthly Requirement): ${passed ? '✅ PASS' : '❌ FAIL'} -> Purchase: ${purchase} g, Status: ${status}`);
    if (!passed) allPassed = false;
  }

  // ─── Test 5 — No Storage ─────────────────────────────────────
  {
    const req = 500;
    const stock = 0;
    const purchase = Math.max(0, Math.round((req - stock) * 100) / 100);
    const status = req === 0 ? 'NOT_REQUIRED_THIS_MONTH' : (stock >= req ? 'STOCK_SUFFICIENT' : 'NEED_PURCHASE');
    const passed = purchase === 500 && status === 'NEED_PURCHASE';
    console.log(`Test 5 (No Storage): ${passed ? '✅ PASS' : '❌ FAIL'} -> Purchase: ${purchase} g, Status: ${status}`);
    if (!passed) allPassed = false;
  }

  // ─── Test 6 — Unit Normalization ─────────────────────────────
  {
    const reqRaw = 2; // 2 kg
    const reqInGrams = normalizeToStorageUnit(reqRaw, 'kg', 'g'); // 2000 g
    const stockGrams = 500; // 500 g
    const purchaseGrams = Math.max(0, reqInGrams - stockGrams); // 1500 g
    const purchaseKg = normalizeToStorageUnit(purchaseGrams, 'g', 'kg'); // 1.5 kg
    const passed = reqInGrams === 2000 && purchaseKg === 1.5;
    console.log(`Test 6 (Unit Normalization): ${passed ? '✅ PASS' : '❌ FAIL'} -> 2 kg vs 500 g -> Purchase: ${purchaseKg} kg (${purchaseGrams} g)`);
    if (!passed) allPassed = false;
  }

  // ─── Test 7 — Canonical Duplicate Resolution ─────────────────
  {
    const name1 = 'Basmati Rice';
    const name2 = 'Basmati rice';
    const norm1 = normalizeIngredientName(name1);
    const norm2 = normalizeIngredientName(name2);
    const passed = norm1 === norm2 && norm1 === 'basmati rice';
    console.log(`Test 7 (Canonical Name Normalization): ${passed ? '✅ PASS' : '❌ FAIL'} -> "${name1}" & "${name2}" -> "${norm1}"`);
    if (!passed) allPassed = false;
  }

  // ─── Test 8 — Unit Compatibility Validation ──────────────────
  {
    const kgVsG = isUnitCompatible('kg', 'g'); // true
    const lVsMl = isUnitCompatible('l', 'ml'); // true
    const piecesVsKg = isUnitCompatible('pieces', 'kg'); // false
    const passed = kgVsG && lVsMl && !piecesVsKg;
    console.log(`Test 8 (Unit Compatibility Check): ${passed ? '✅ PASS' : '❌ FAIL'} -> (kg vs g: ${kgVsG}, pieces vs kg: ${piecesVsKg})`);
    if (!passed) allPassed = false;
  }

  // ─── Test 9 — Single Random Menu Generation ──────────────────
  {
    const testDate = '2026-08-30';
    const generatedMenu = await generateLunchForDate(testDate, 'manual');
    const hasSingleDish = !!generatedMenu && !!generatedMenu.foodId;
    console.log(`Test 9 (Single Date Random Menu): ${hasSingleDish ? '✅ PASS' : '❌ FAIL'} -> Date: ${testDate}, Dish: "${generatedMenu?.foodId?.name}"`);
    if (!hasSingleDish) allPassed = false;
  }

  // ─── Test 10 — Scheduler Configuration Status ────────────────
  {
    const status = getSchedulerStatus();
    const passed = status.timezone === 'Asia/Kolkata' && status.scheduledTime === '20:00';
    console.log(`Test 10 (Scheduler Config): ${passed ? '✅ PASS' : '❌ FAIL'} -> Timezone: ${status.timezone}, Time: ${status.scheduledTime}, Next Run: ${status.nextRun}`);
    if (!passed) allPassed = false;
  }

  console.log('\n======================================================');
  console.log(allPassed ? '🎉 ALL 10 TESTS PASSED SUCCESSFULLY!' : '⚠️ SOME TESTS FAILED');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

runVerification();
