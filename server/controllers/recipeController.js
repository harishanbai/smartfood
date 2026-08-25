import Recipe from '../models/Recipe.js';
import { translateResponse } from '../utils/translator.js';

/**
 * GET /api/recipes
 * Retrieves all 28 authentic recipes with their 10-person base quantities
 */
export const getRecipes = async (req, res) => {
  try {
    const { foodType, category, search } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    let query = { isActive: true };
    if (foodType && foodType !== 'all') query.foodType = foodType;
    if (category && category !== 'all') query.category = category;
    if (search && search.trim()) {
      const regex = search.trim();
      query.$or = [
        { name: { $regex: regex, $options: 'i' } },
        { name_ta: { $regex: regex, $options: 'i' } },
        { 'ingredients.name': { $regex: regex, $options: 'i' } },
        { 'ingredients.name_ta': { $regex: regex, $options: 'i' } }
      ];
    }

    const recipes = await Recipe.find(query).sort({ mealNumber: 1 });
    res.json(translateResponse(recipes, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recipes', error: error.message });
  }
};

/**
 * GET /api/recipes/:idOrNumber
 * Retrieve a single recipe by mealNumber (1-28) or MongoDB ObjectId
 */
export const getRecipeByIdOrNumber = async (req, res) => {
  try {
    const { idOrNumber } = req.params;
    const lang = req.headers['accept-language'] || 'en';

    let recipe = null;
    if (!isNaN(idOrNumber)) {
      recipe = await Recipe.findOne({ mealNumber: Number(idOrNumber) });
    } else {
      recipe = await Recipe.findById(idOrNumber);
    }

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(translateResponse(recipe, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recipe', error: error.message });
  }
};

/**
 * PUT /api/recipes/:id
 * Update recipe ingredients or base values
 */
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_ta, foodType, category, description, basePersons, ingredients } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (name) recipe.name = name;
    if (name_ta) recipe.name_ta = name_ta;
    if (foodType) recipe.foodType = foodType;
    if (category) recipe.category = category;
    if (description !== undefined) recipe.description = description;
    if (basePersons) recipe.basePersons = Number(basePersons);
    if (Array.isArray(ingredients)) recipe.ingredients = ingredients;

    await recipe.save();
    res.json(translateResponse(recipe, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};
