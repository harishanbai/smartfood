import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import { normalizeIngredientName } from '../utils/ingredientNormalizer.js';
import { SUGGESTED_STORAGE_STOCK } from '../services/seedIngredientData.js';
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
 * Update recipe ingredients or base values with Grocery Storage synchronization
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

    const oldIngredients = recipe.ingredients || [];

    if (name && typeof name === 'string') {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Dish name cannot be empty' });
      }
      recipe.name = trimmed;
    }

    if (name_ta !== undefined && typeof name_ta === 'string') {
      recipe.name_ta = name_ta.trim() || recipe.name_ta || recipe.name;
    }

    if (foodType && ['veg', 'non-veg'].includes(foodType.toLowerCase())) {
      recipe.foodType = foodType.toLowerCase();
    }

    if (category && typeof category === 'string') {
      recipe.category = category.trim();
    }

    if (description !== undefined && typeof description === 'string') {
      recipe.description = description.trim();
    }

    if (basePersons !== undefined) {
      const persons = Number(basePersons);
      if (isNaN(persons) || persons <= 0) {
        return res.status(400).json({ message: 'Base persons must be a positive number' });
      }
      recipe.basePersons = persons;
    }

    if (Array.isArray(ingredients)) {
      const sanitizedIngredients = [];
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        if (!ing || !ing.name || !ing.name.trim()) {
          return res.status(400).json({ message: `Ingredient #${i + 1} must have a valid name` });
        }

        const qty = Number(ing.baseQuantity);
        if (isNaN(qty) || qty < 0) {
          return res.status(400).json({ message: `Ingredient "${ing.name}" must have a valid non-negative base quantity` });
        }

        const ingName = ing.name.trim();
        const normName = normalizeIngredientName(ingName) || ingName.toLowerCase();
        const isFresh = typeof ing.category === 'string' && ing.category.trim().toLowerCase().startsWith('fresh');
        const ingCategory = isFresh ? 'fresh' : 'grocery';
        const ingNameTa = (ing.name_ta || '').trim();
        const ingUnit = (ing.unit || (ingCategory === 'fresh' ? 'kg' : 'g')).trim();
        let linkedIngredientId = ing.ingredientId || null;

        // ── 1. Grocery Storage Synchronization ──
        if (ingCategory === 'grocery') {
          const escapedName = ingName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          let ingDoc = await Ingredient.findOne({
            $or: [
              { normalizedName: normName },
              { name: { $regex: new RegExp(`^${escapedName}$`, 'i') } }
            ]
          });

          if (ingDoc) {
            let modified = false;
            if (!ingDoc.isStorageItem) {
              ingDoc.isStorageItem = true;
              modified = true;
            }
            if (ingDoc.category !== 'grocery') {
              ingDoc.category = 'grocery';
              modified = true;
            }
            if (ingNameTa && !ingDoc.name_ta) {
              ingDoc.name_ta = ingNameTa;
              modified = true;
            }
            if (ingDoc.currentStock === 0 && ingUnit && ingDoc.defaultUnit !== ingUnit) {
              ingDoc.defaultUnit = ingUnit;
              modified = true;
            }
            if (modified) {
              ingDoc.lastUpdated = new Date();
              await ingDoc.save();
            }
            linkedIngredientId = ingDoc._id;
          } else {
            // Create new grocery storage item without modifying physical stock (currentStock = 0)
            const defaultStorageUnit = (ingUnit || 'g').trim();
            const newIngDoc = new Ingredient({
              name: ingName,
              normalizedName: normName,
              name_ta: ingNameTa,
              category: 'grocery',
              defaultUnit: defaultStorageUnit,
              currentStock: 0,
              minStock: 0,
              suggestedStorageStock: 0,
              isStorageItem: true,
              lastUpdated: new Date()
            });
            await newIngDoc.save();
            linkedIngredientId = newIngDoc._id;
          }
        } else {
          // Fresh Items must stay separate from grocery storage
          const escapedName = ingName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          let ingDoc = await Ingredient.findOne({
            $or: [
              { normalizedName: normName },
              { name: { $regex: new RegExp(`^${escapedName}$`, 'i') } }
            ]
          });
          if (ingDoc) {
            linkedIngredientId = ingDoc._id;
          }
        }

        sanitizedIngredients.push({
          name: ingName,
          name_ta: ingNameTa,
          category: ingCategory,
          baseQuantity: qty,
          unit: ingUnit,
          ingredientId: linkedIngredientId
        });
      }

      // ── 2. Safe Deletion & Multi-Dish Check for Removed Groceries ──
      const newGroceryNorms = new Set(
        sanitizedIngredients
          .filter(i => i.category === 'grocery')
          .map(i => normalizeIngredientName(i.name))
      );

      const removedGroceryIngs = oldIngredients.filter(
        oldIng => oldIng.category === 'grocery' && !newGroceryNorms.has(normalizeIngredientName(oldIng.name))
      );

      if (removedGroceryIngs.length > 0) {
        const otherRecipes = await Recipe.find({
          _id: { $ne: recipe._id },
          isActive: true
        });

        for (const rem of removedGroceryIngs) {
          const remNorm = normalizeIngredientName(rem.name);
          const stillUsedByOther = otherRecipes.some(r =>
            (r.ingredients || []).some(
              otherIng => otherIng.category === 'grocery' && normalizeIngredientName(otherIng.name) === remNorm
            )
          );

          // If no other dish requires this grocery item anymore
          if (!stillUsedByOther) {
            const ingDoc = await Ingredient.findOne({ normalizedName: remNorm });
            if (ingDoc) {
              const isCoreStaple = SUGGESTED_STORAGE_STOCK.some(
                s => normalizeIngredientName(s.name) === remNorm
              );

              // 🚨 DO NOT DELETE PHYSICAL STOCK
              if (ingDoc.currentStock > 0 || isCoreStaple) {
                // Preserve physical inventory in storage
              } else {
                // Remove recipe-linked requirement from storage view
                ingDoc.isStorageItem = false;
                await ingDoc.save();
              }
            }
          }
        }
      }

      recipe.ingredients = sanitizedIngredients;
    }

    await recipe.save();
    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe: translateResponse(recipe, lang)
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

