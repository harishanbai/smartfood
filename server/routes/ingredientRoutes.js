import express from 'express';
import {
  getIngredients,
  getStorageInventory,
  addIngredient,
  updateStock,
  deleteIngredient,
  getTransactions
} from '../controllers/ingredientController.js';

const router = express.Router();

router.get('/', getIngredients);
router.get('/storage', getStorageInventory);
router.post('/', addIngredient);
router.put('/:id/stock', updateStock);
router.delete('/:id', deleteIngredient);
router.get('/transactions', getTransactions);

export default router;
