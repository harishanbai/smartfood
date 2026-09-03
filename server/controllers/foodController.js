import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import { translateResponse } from '../utils/translator.js';

/**
 * Ensures a corresponding Dish Recipe entry exists for the given Food item.
 */
export const ensureRecipeForFood = async (food) => {
  if (!food || !food._id) return null;

  // 1. Check if recipe already exists linked to this foodId
  let recipe = await Recipe.findOne({ foodId: food._id });
  if (recipe) return recipe;

  // 2. Check if an existing recipe matches by name without a foodId link
  recipe = await Recipe.findOne({ name: food.name });
  if (recipe && !recipe.foodId) {
    recipe.foodId = food._id;
    if (!recipe.category && food.category) recipe.category = food.category;
    if (!recipe.description && food.description) recipe.description = food.description;
    if (!recipe.foodType && food.foodType) recipe.foodType = food.foodType;
    await recipe.save();
    return recipe;
  }

  // 3. Find next available mealNumber
  const lastRecipe = await Recipe.findOne().sort({ mealNumber: -1 });
  const nextMealNumber = (lastRecipe && typeof lastRecipe.mealNumber === 'number') ? lastRecipe.mealNumber + 1 : 1;

  // 4. Create empty linked recipe
  recipe = new Recipe({
    mealNumber: nextMealNumber,
    name: food.name,
    name_ta: food.name_ta || food.name,
    foodType: food.foodType || 'veg',
    category: food.category || 'Main Course',
    description: food.description || '',
    basePersons: 10,
    foodId: food._id,
    ingredients: [],
    isActive: true
  });
  await recipe.save();
  return recipe;
};

export const getFoods = async (req, res) => {
  try {
    const { search } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    let query = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = search.trim();
      query = {
        $or: [
          { name: { $regex: searchRegex, $options: 'i' } },
          { name_ta: { $regex: searchRegex, $options: 'i' } },
          { category: { $regex: searchRegex, $options: 'i' } },
          { description: { $regex: searchRegex, $options: 'i' } }
        ]
      };
    }
    const foods = await Food.find(query).select('-image.data').sort({ createdAt: -1 });
    res.json(translateResponse(foods, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving food list', error: error.message });
  }
};

export const addFood = async (req, res) => {
  try {
    const { name, name_ta, category, description, available, foodType } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    if (!name || !category || !description) {
      return res.status(400).json({ message: 'Name, category, and description are required fields.' });
    }

    let imageObj = null;
    if (req.file) {
      imageObj = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const foodData = {
      name,
      name_ta: name_ta || '',
      category,
      description,
      available: available === 'false' || available === false ? false : true,
      foodType: foodType === 'non-veg' ? 'non-veg' : 'veg'
    };

    if (imageObj) {
      foodData.image = imageObj;
    }

    const food = new Food(foodData);
    await food.save();

    // Automatically create / link Recipe for the new food
    await ensureRecipeForFood(food);

    res.status(201).json(translateResponse(food, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error adding food item', error: error.message });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_ta, category, description, available, foodType } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    let imageObj = null;
    if (req.file) {
      imageObj = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (name) food.name = name;
    if (name_ta !== undefined) food.name_ta = name_ta;
    if (category) food.category = category;
    if (description) food.description = description;
    if (available !== undefined) {
      food.available = available === 'false' || available === false ? false : true;
    }
    if (foodType) {
      food.foodType = foodType === 'non-veg' ? 'non-veg' : 'veg';
    }
    if (imageObj) food.image = imageObj;

    await food.save();

    // Synchronize linked Recipe if present
    const linkedRecipe = await Recipe.findOne({ foodId: food._id });
    if (linkedRecipe) {
      if (name) linkedRecipe.name = name;
      if (name_ta !== undefined) linkedRecipe.name_ta = name_ta;
      if (category) linkedRecipe.category = category;
      if (description) linkedRecipe.description = description;
      if (foodType) linkedRecipe.foodType = foodType === 'non-veg' ? 'non-veg' : 'veg';
      await linkedRecipe.save();
    } else {
      await ensureRecipeForFood(food);
    }

    res.json(translateResponse(food, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error updating food item', error: error.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findByIdAndDelete(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // When a food item is deleted, delete its corresponding recipe so it does not linger in Dish Recipes
    await Recipe.deleteMany({ foodId: id });

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food item', error: error.message });
  }
};

export const patchAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (available === undefined) {
      return res.status(400).json({ message: 'available field is required.' });
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    food.available = available;
    await food.save();
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error patching food availability', error: error.message });
  }
};

/**
 * Serves a food item's image directly from MongoDB as binary data.
 * GET /api/foods/:id/image
 */
export const getFoodImage = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food || !food.image || !food.image.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', food.image.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.send(food.image.data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving image', error: error.message });
  }
};

