/**
 * systemController.js
 *
 * Exposes system-level endpoints for scheduler status and manual test triggers.
 *
 * Routes:
 *   GET  /api/system/scheduler-status    → getSchedulerStatusHandler
 *   POST /api/system/test-auto-generation → testAutoGenerationHandler
 */

import { getSchedulerStatus, runAutoGeneration } from '../services/schedulerService.js';
import { getKolkataDateStr } from '../utils/dateUtils.js';

/**
 * GET /api/system/scheduler-status
 * Returns the current state of the auto-generation scheduler.
 */
export const getSchedulerStatusHandler = (req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scheduler status',
      error: error.message,
    });
  }
};

/**
 * POST /api/system/test-auto-generation
 * Manually triggers the same logic used at 8 PM.
 * Useful for testing on Render without waiting for 8 PM.
 *
 * Optional body: { "date": "YYYY-MM-DD" } to test a specific date
 */
export const testAutoGenerationHandler = async (req, res) => {
  try {
    const { date } = req.body || {};
    const targetDate = date || getKolkataDateStr(1);

    console.log(`[SystemController] 🧪 Manual test trigger for date: ${targetDate}`);

    const result = await runAutoGeneration(targetDate);

    if (result.error) {
      return res.status(500).json({
        success: false,
        date: targetDate,
        message: `Auto generation failed: ${result.error}`,
        error: result.error,
      });
    }

    if (result.skipped) {
      return res.json({
        success: true,
        date: targetDate,
        skipped: true,
        message: result.reason || 'Menu already exists for this date — generation skipped.',
      });
    }

    const foodName =
      result.menu?.foodId?.name ||
      result.menu?.vegFoodId?.name ||
      result.menu?.nonVegFoodId?.name ||
      'Unknown';

    res.status(201).json({
      success: true,
      date: targetDate,
      skipped: false,
      message: `Auto generation completed successfully. Food: "${foodName}"`,
      menu: {
        id: result.menu?._id,
        date: result.menu?.date,
        food: foodName,
        ruleApplied: result.menu?.ruleApplied,
        ruleCode: result.menu?.ruleCode,
        generationType: result.menu?.generationType,
        scheduledTime: result.menu?.scheduledTime,
        generatedAt: result.menu?.generatedAt,
      },
    });
  } catch (error) {
    console.error('[SystemController] testAutoGeneration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unexpected error during test auto generation',
      error: error.message,
    });
  }
};
