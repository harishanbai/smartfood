import express from 'express';
import {
  getDailyRequirement,
  saveDailyRequirement,
  confirmStockDeduction
} from '../controllers/requirementController.js';

const router = express.Router();

router.get('/daily', getDailyRequirement);
router.post('/daily/save', saveDailyRequirement);
router.post('/daily/deduct-stock', confirmStockDeduction);


export default router;
