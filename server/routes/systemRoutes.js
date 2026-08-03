/**
 * systemRoutes.js
 *
 * System & Scheduler management routes.
 *
 * Endpoints:
 *   GET  /api/system/scheduler-status
 *   POST /api/system/test-auto-generation
 */

import express from 'express';
import {
  getSchedulerStatusHandler,
  testAutoGenerationHandler,
} from '../controllers/systemController.js';

const router = express.Router();

router.get('/scheduler-status', getSchedulerStatusHandler);
router.post('/test-auto-generation', testAutoGenerationHandler);

export default router;
