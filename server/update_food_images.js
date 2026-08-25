import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Food from './models/Food.js';
import Recipe from './models/Recipe.js';

const MEAL_IMAGE_MAP = {
  1: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', // Veg Biryani
  2: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', // Lemon Rice
  3: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', // Tomato Rice
  4: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', // Curd Rice
  5: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', // Sambar Meals
  6: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', // Vatha Kuzhambu
  7: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', // Rasam & Egg
  8: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', // Mushroom Biryani
  9: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', // Paneer Butter Masala
  10: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', // Mor Kuzhambu
  11: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', // Ghee Rice & Dal
  12: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', // Chicken Biryani
  13: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', // Fish Curry
  14: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', // Chicken Chettinad
  15: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', // Egg Biryani
  16: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80', // Prawn Thokku
  17: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', // Sambar, Egg Masala
  18: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', // Chicken Kulambu
  19: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', // Sambar Feast
  20: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', // Kuska
  21: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', // Egg Kuzhambu
  22: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', // Chicken Fried Rice
  23: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', // Veg Pulao
  24: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', // Pepper Chicken
  25: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', // Pudina Rice
  26: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', // Kara Kuzhambu
  27: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', // Butter Chicken
  28: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'  // Mutton Sukka
};

const getFallbackByDishName = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('biryani') || n.includes('briyani') || n.includes('kuska')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  if (n.includes('chicken') || n.includes('pepper') || n.includes('chettinad')) return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80';
  if (n.includes('fish') || n.includes('meen')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80';
  if (n.includes('prawn') || n.includes('eral')) return 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80';
  if (n.includes('mutton') || n.includes('sukka')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  if (n.includes('egg') || n.includes('omelette') || n.includes('muttai')) return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';
  if (n.includes('paneer') || n.includes('pulao')) return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
  if (n.includes('rice') || n.includes('sambar') || n.includes('kuzhambu') || n.includes('rasam') || n.includes('meals')) return 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80';
  return 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80';
};

async function updateFoodImages() {
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  const recipes = await Recipe.find({});
  console.log(`Found ${recipes.length} recipes.`);

  for (const recipe of recipes) {
    const imgUrl = MEAL_IMAGE_MAP[recipe.mealNumber] || getFallbackByDishName(recipe.name);
    if (recipe.foodId) {
      await Food.findByIdAndUpdate(recipe.foodId, {
        $set: {
          imageUrl: imgUrl,
          image: { contentType: 'image/jpeg' }
        }
      });
      console.log(`Updated food for recipe #${recipe.mealNumber}: ${recipe.name}`);
    }
  }

  // Also update any other foods without imageUrl
  const allFoods = await Food.find({});
  for (const food of allFoods) {
    if (!food.imageUrl || food.imageUrl === '') {
      const fallbackUrl = getFallbackByDishName(food.name);
      food.imageUrl = fallbackUrl;
      food.image = food.image || { contentType: 'image/jpeg' };
      await food.save();
      console.log(`Updated standalone food: ${food.name}`);
    }
  }

  console.log('🎉 All foods successfully populated with high-quality visual imagery!');
  await mongoose.disconnect();
}

updateFoodImages();
