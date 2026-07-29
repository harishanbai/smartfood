import express from 'express';
import {
  getTodayCalendar,
  getTomorrowCalendar,
} from '../controllers/tamilCalendarController.js';

const router = express.Router();

// GET /api/tamil-calendar/today
router.get('/today', getTodayCalendar);

// GET /api/tamil-calendar/tomorrow
router.get('/tomorrow', getTomorrowCalendar);

export default router;
