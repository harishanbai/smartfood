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
import mongoose from 'mongoose';
import Menu from '../models/Menu.js';
import { generateLunchForDate } from './generatorService.js';
import { getKolkataDateStr, getCurrentISTHour } from '../utils/dateUtils.js';

// ─── State ────────────────────────────────────────────────────────────────────

const SCHEDULER_TIMEZONE = 'Asia/Kolkata';
const SCHEDULED_CRON = '0 20 * * *';  // 8:00 PM daily
const SCHEDULED_TIME = '20:00';

let schedulerRunning = false;
let lastRun = null;   // ISO string of last successful auto-generation run
let schedulerTask = null;   // node-cron task reference
let backupTask = null;   // backup periodic check task
let isCheckingMissed = false;  // Mutex flag to prevent overlapping catchup runs

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the next 8:00 PM IST as a human-readable string.
 */
const getNextRunIST = () => {
  const currentHour = getCurrentISTHour();
  const targetDateStr = currentHour >= 20 ? getKolkataDateStr(1) : getKolkataDateStr(0);
  const [year, month, day] = targetDateStr.split('-');
  return `${day}/${month}/${year}, 20:00:00 IST`;
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
  const todayStr = getKolkataDateStr(0);

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
    const menu = await generateLunchForDate(tomorrowStr, 'automatic', { scheduledTime: SCHEDULED_TIME });

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
 * Checks if the server missed scheduled generations (e.g. after a restart or downtime).
 * 1. Checks if today's menu exists (recovers if yesterday's 8 PM run was missed).
 * 2. If current IST time >= 20:00, checks if tomorrow's menu exists (recovers if today's 8 PM run was missed).
 */
export const checkMissedGeneration = async () => {
  if (isCheckingMissed) return;
  isCheckingMissed = true;

  try {
    // 1. Ensure today's active menu exists
    const todayStr = getKolkataDateStr(0);
    const todayMenu = await Menu.findOne({ date: todayStr, status: 'active' });
    if (!todayMenu) {
      console.log(`[Scheduler] ⚠️  Missed generation detected! No active menu for today (${todayStr}). Running catch-up...`);
      await runAutoGeneration(todayStr);
    }

    // 2. If past 8:00 PM IST, ensure tomorrow's active menu exists
    const istHour = getCurrentISTHour();
    if (istHour >= 20) {
      const tomorrowStr = getKolkataDateStr(1);
      const tomorrowMenu = await Menu.findOne({ date: tomorrowStr, status: 'active' });

      if (!tomorrowMenu) {
        console.log(`[Scheduler] ⚠️  Missed generation detected! IST hour=${istHour} (>= 20), no menu for tomorrow (${tomorrowStr}). Running catch-up...`);
        await runAutoGeneration(tomorrowStr);
      } else {
        console.log(`[Scheduler] Menu for tomorrow (${tomorrowStr}) already exists — no catch-up needed.`);
      }
    } else {
      console.log(`[Scheduler] Current IST hour: ${istHour}:xx — 8 PM not yet reached today.`);
    }

  } catch (err) {
    console.error('[Scheduler] Error during missed-generation check:', err.message);
  } finally {
    isCheckingMissed = false;
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

  // Register the daily 8:00 PM IST cron task
  schedulerTask = cron.schedule(
    SCHEDULED_CRON,
    async () => {
      await runAutoGeneration();
    },
    { timezone: SCHEDULER_TIMEZONE }
  );

  // Register hourly backup check to catch any missed runs due to sleep/wake delays
  backupTask = cron.schedule(
    '0 * * * *',
    async () => {
      await checkMissedGeneration();
    },
    { timezone: SCHEDULER_TIMEZONE }
  );

  schedulerRunning = true;

  // Check for missed generation once DB is ready
  let startupCheckDone = false;
  const runStartupCheck = () => {
    if (startupCheckDone) return;
    startupCheckDone = true;
    checkMissedGeneration();
  };

  if (mongoose.connection.readyState === 1) {
    runStartupCheck();
  } else {
    mongoose.connection.once('open', () => {
      setTimeout(runStartupCheck, 1000);
    });
    // Fallback timer
    setTimeout(() => {
      if (mongoose.connection.readyState === 1) {
        runStartupCheck();
      }
    }, 5000);
  }
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
