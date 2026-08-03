/**
 * schedulerService.js
 *
 * Manages the Auto Lunch Generation Scheduler.
 *
 * Responsibilities:
 *   - Schedule daily 8:00 PM IST auto-generation of tomorrow's lunch menu
 *   - Startup: print initialization logs and detect missed generations
 *   - Execution: print detailed logs for every run
 *   - Status: expose scheduler metadata for API endpoint
 */

import cron from 'node-cron';
import Menu from '../models/Menu.js';
import { generateLunchForDate } from './generatorService.js';
import { getKolkataDateStr } from '../utils/dateUtils.js';

// ─── State ────────────────────────────────────────────────────────────────────

const SCHEDULER_TIMEZONE = 'Asia/Kolkata';
const SCHEDULED_CRON    = '0 20 * * *';  // 8:00 PM daily
const SCHEDULED_TIME    = '20:00';

let schedulerRunning = false;
let lastRun          = null;   // ISO string of last successful auto-generation run
let schedulerTask    = null;   // node-cron task reference

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the next 8:00 PM IST as a human-readable string.
 */
const getNextRunIST = () => {
  const now = new Date();
  // Find next 20:00 IST = 14:30 UTC
  const todayIST = new Date(
    new Date().toLocaleString('en-US', { timeZone: SCHEDULER_TIMEZONE })
  );
  const nextRun = new Date(now);

  // Set to 20:00 IST today (14:30 UTC)
  nextRun.setUTCHours(14, 30, 0, 0);

  // If we're already past 20:00 IST today, schedule for tomorrow
  if (todayIST.getHours() >= 20) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }

  return nextRun.toLocaleString('en-IN', {
    timeZone: SCHEDULER_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' IST';
};

/**
 * Returns current IST hour (0–23).
 */
const getCurrentISTHour = () => {
  const nowIST = new Date().toLocaleString('en-US', { timeZone: SCHEDULER_TIMEZONE, hour: 'numeric', hour12: false });
  return parseInt(nowIST, 10);
};

// ─── Core Auto-Generation Logic ───────────────────────────────────────────────

/**
 * Runs the auto-generation for tomorrow's lunch.
 * Checks for duplicate, logs all steps, stores scheduledTime metadata.
 *
 * @param {string} [overrideDateStr] - Optional date override for testing (defaults to tomorrow IST)
 * @returns {Promise<{ skipped: boolean, menu?: Object, error?: string }>}
 */
export const runAutoGeneration = async (overrideDateStr = null) => {
  const tomorrowStr = overrideDateStr || getKolkataDateStr(1);
  const todayStr    = getKolkataDateStr(0);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🕗 Auto Generation Triggered');
  console.log(`📅 Date: ${tomorrowStr} (Today: ${todayStr})`);

  try {
    // Duplicate prevention: check if an active menu already exists for tomorrow
    const existing = await Menu.findOne({ date: tomorrowStr, status: 'active' });
    if (existing) {
      console.log(`⏭️  Menu already exists for ${tomorrowStr} — skipping duplicate generation.`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return { skipped: true, reason: 'Menu already exists for this date.' };
    }

    // Run generation
    const menu = await generateLunchForDate(tomorrowStr, 'AUTO', { scheduledTime: SCHEDULED_TIME });

    const foodName =
      menu.foodId?.name ||
      menu.vegFoodId?.name ||
      menu.nonVegFoodId?.name ||
      'Unknown Dish';

    const ruleApplied = menu.ruleApplied || 'Normal Random';

    console.log(`🍽️  Selected Food: ${foodName}`);
    console.log(`📋 Rule Applied: ${ruleApplied}`);
    console.log(`💾 Saved to Database (Menu ID: ${menu._id})`);
    console.log(`✅ Auto Generation Completed for ${tomorrowStr}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    lastRun = new Date().toISOString();
    return { skipped: false, menu };

  } catch (error) {
    console.error(`❌ Auto Generation FAILED for ${tomorrowStr}: ${error.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { skipped: false, error: error.message };
  }
};

// ─── Missed Generation Detection ─────────────────────────────────────────────

/**
 * Checks if the server missed the 8 PM generation (e.g. after a restart).
 * If current IST time >= 20:00 and tomorrow has no active menu, generate now.
 */
const checkMissedGeneration = async () => {
  try {
    const istHour = getCurrentISTHour();
    if (istHour < 20) {
      console.log(`[Scheduler] Current IST hour: ${istHour}:xx — 8 PM not yet reached, no missed generation.`);
      return;
    }

    const tomorrowStr = getKolkataDateStr(1);
    const existing = await Menu.findOne({ date: tomorrowStr, status: 'active' });

    if (existing) {
      console.log(`[Scheduler] Menu for tomorrow (${tomorrowStr}) already exists — no catch-up needed.`);
      return;
    }

    console.log(`[Scheduler] ⚠️  Missed generation detected! IST hour=${istHour}, no menu for ${tomorrowStr}. Running catch-up...`);
    await runAutoGeneration(tomorrowStr);

  } catch (err) {
    console.error('[Scheduler] Error during missed-generation check:', err.message);
  }
};

// ─── Scheduler Initialization ─────────────────────────────────────────────────

/**
 * Initializes the cron scheduler. Call this once on server startup.
 * Prints startup logs, schedules the 8 PM IST cron, and checks for missed runs.
 */
export const initScheduler = () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Auto Lunch Scheduler Initialized');
  console.log(`✅ Timezone: ${SCHEDULER_TIMEZONE}`);
  console.log(`✅ Schedule: ${SCHEDULED_CRON} (Every day at ${SCHEDULED_TIME})`);
  console.log(`✅ Next Run: ${getNextRunIST()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Register the cron task
  schedulerTask = cron.schedule(
    SCHEDULED_CRON,
    async () => {
      await runAutoGeneration();
    },
    { timezone: SCHEDULER_TIMEZONE }
  );

  schedulerRunning = true;

  // Check for missed generation after a short delay (let DB connect first)
  setTimeout(checkMissedGeneration, 5000);
};

// ─── Status API ───────────────────────────────────────────────────────────────

/**
 * Returns the current scheduler status object.
 * @returns {Object}
 */
export const getSchedulerStatus = () => ({
  schedulerRunning,
  timezone: SCHEDULER_TIMEZONE,
  schedule: SCHEDULED_CRON,
  scheduledTime: SCHEDULED_TIME,
  nextRun: getNextRunIST(),
  lastRun: lastRun || 'Not yet run this session',
});
