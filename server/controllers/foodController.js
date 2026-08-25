import Food from '../models/Food.js';
import { translateResponse } from '../utils/translator.js';

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

