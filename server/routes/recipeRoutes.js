import express from 'express';
import {
  getRecipes,
  getRecipeByIdOrNumber,
  updateRecipe
} from '../controllers/recipeController.js';

const router = express.Router();

router.get('/', getRecipes);
router.get('/:idOrNumber', getRecipeByIdOrNumber);
router.put('/:id', updateRecipe);

export default router;
