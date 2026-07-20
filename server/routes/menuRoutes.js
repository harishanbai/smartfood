import express from 'express';
import {
  getTodayMenu,
  getTomorrowMenu,
  generateTomorrowMenu,
  skipTomorrowMenu,
  getMenuHistory,
  assignMenu
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/today', getTodayMenu);
router.get('/tomorrow', getTomorrowMenu);
router.post('/generate', generateTomorrowMenu);
router.post('/skip', skipTomorrowMenu);
router.get('/history', getMenuHistory);
router.post('/', assignMenu);

export default router;
