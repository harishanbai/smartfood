import express from 'express';
import {
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  patchAvailability,
  getFoodImage
} from '../controllers/foodController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getFoods);
router.post('/', upload.single('image'), addFood);
router.put('/:id', upload.single('image'), updateFood);
router.delete('/:id', deleteFood);
router.patch('/:id/availability', patchAvailability);
router.get('/:id/image', getFoodImage);

export default router;
