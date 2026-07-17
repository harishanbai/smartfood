import Food from '../models/Food.js';
import { uploadImage } from '../config/cloudinary.js';
import { mockDb } from '../services/mockDbService.js';

// Get base URL for local file uploads fallback
const getServerBaseUrl = (req) => {
  return `${req.protocol}://${req.get('host')}`;
};

export const getFoods = async (req, res) => {
  try {
    const { search } = req.query;
    if (process.env.USE_MOCK_DB === 'true') {
      const foods = mockDb.getFoods(search);
      return res.json(foods);
    }
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const foods = await Food.find(query).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving food list', error: error.message });
  }
};

export const addFood = async (req, res) => {
  try {
    const { name, category, description, available } = req.body;

    if (!name || !category || !description) {
      return res.status(400).json({ message: 'Name, category, and description are required fields.' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file.path, getServerBaseUrl(req));
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const foodData = {
      name,
      category,
      description,
      image: imageUrl,
      available: available === 'false' || available === false ? false : true
    };

    if (process.env.USE_MOCK_DB === 'true') {
      const food = mockDb.addFood(foodData);
      return res.status(201).json(food);
    }

    const food = new Food(foodData);
    await food.save();
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error adding food item', error: error.message });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, available } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file.path, getServerBaseUrl(req));
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (available !== undefined) {
      updateData.available = available === 'false' || available === false ? false : true;
    }
    if (imageUrl) updateData.image = imageUrl;

    if (process.env.USE_MOCK_DB === 'true') {
      const food = mockDb.updateFood(id, updateData);
      if (!food) return res.status(404).json({ message: 'Food item not found' });
      return res.json(food);
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (name) food.name = name;
    if (category) food.category = category;
    if (description) food.description = description;
    if (available !== undefined) {
      food.available = available === 'false' || available === false ? false : true;
    }
    if (imageUrl) food.image = imageUrl;

    await food.save();
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food item', error: error.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (process.env.USE_MOCK_DB === 'true') {
      const success = mockDb.deleteFood(id);
      if (!success) return res.status(404).json({ message: 'Food item not found' });
      return res.json({ message: 'Food item deleted successfully' });
    }

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

    if (process.env.USE_MOCK_DB === 'true') {
      const food = mockDb.patchAvailability(id, available);
      if (!food) return res.status(404).json({ message: 'Food item not found' });
      return res.json(food);
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
