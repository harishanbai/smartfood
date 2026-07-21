import Food from '../models/Food.js';
import { translateResponse } from '../utils/translator.js';

export const getFoods = async (req, res) => {
  try {
    const { search } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { name_ta: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { description_ta: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const foods = await Food.find(query).sort({ createdAt: -1 });
    res.json(translateResponse(foods, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving food list', error: error.message });
  }
};

export const addFood = async (req, res) => {
  try {
    const { name, name_ta, category, description, description_ta, available } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    if (!name || !category || !description) {
      return res.status(400).json({ message: 'Name, category, and description are required fields.' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const foodData = {
      name,
      name_ta: name_ta || '',
      category,
      description,
      description_ta: description_ta || '',
      image: imageUrl,
      available: available === 'false' || available === false ? false : true
    };

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
    const { name, name_ta, category, description, description_ta, available } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (name) food.name = name;
    if (name_ta !== undefined) food.name_ta = name_ta;
    if (category) food.category = category;
    if (description) food.description = description;
    if (description_ta !== undefined) food.description_ta = description_ta;
    if (available !== undefined) {
      food.available = available === 'false' || available === false ? false : true;
    }
    if (imageUrl) food.image = imageUrl;

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
