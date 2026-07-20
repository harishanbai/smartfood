import express from 'express';
import {
  getTodayMenu,
  getTomorrowMenu,
  generateTomorrowMenu,
  skipTomorrowMenu,
  getMenuHistory,
  assignMenu,
  deleteMenuRecord
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/today', getTodayMenu);
router.get('/tomorrow', getTomorrowMenu);
router.post('/generate', generateTomorrowMenu);
router.post('/skip', skipTomorrowMenu);
router.get('/history', getMenuHistory);
router.post('/', assignMenu);
router.delete('/:id', deleteMenuRecord);

export default router;
