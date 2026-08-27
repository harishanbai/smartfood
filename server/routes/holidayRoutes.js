import express from 'express';
import {
  getHolidays,
  checkHoliday,
  markHoliday,
  removeHoliday
} from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', getHolidays);
router.get('/check', checkHoliday);
router.post('/', markHoliday);
router.post('/remove', removeHoliday);
router.delete('/:date', removeHoliday);

export default router;
