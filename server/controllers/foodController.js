import Food from '../models/Food.js';

export const getFoods = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = search.trim();
      query = {
        $or: [
          { name: { $regex: searchRegex, $options: 'i' } },
          { category: { $regex: searchRegex, $options: 'i' } },
          { description: { $regex: searchRegex, $options: 'i' } }
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
    const { name, category, description, available, foodType } = req.body;

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
      category,
      description,
      image: imageUrl,
      available: available === 'false' || available === false ? false : true,
      foodType: foodType === 'non-veg' ? 'non-veg' : 'veg'
    };

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
    const { name, category, description, available, foodType } = req.body;

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
    if (category) food.category = category;
    if (description) food.description = description;
    if (available !== undefined) {
      food.available = available === 'false' || available === false ? false : true;
    }
    if (foodType) {
      food.foodType = foodType === 'non-veg' ? 'non-veg' : 'veg';
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
