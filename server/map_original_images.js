import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Food from './models/Food.js';
import Recipe from './models/Recipe.js';

async function mapOriginalImages() {
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  const originalFoods = await Food.find({ 'image.data': { $exists: true, $ne: null } });
  console.log(`Original Foods with user's binary images: ${originalFoods.length}`);
  
  for (const f of originalFoods) {
    console.log(`- "${f.name}" (${f.name_ta}) [ID: ${f._id}] -> Binary Size: ${f.image.data.length} bytes`);
  }

  const recipes = await Recipe.find({});
  console.log(`\nTotal Recipes: ${recipes.length}`);
  for (const r of recipes) {
    console.log(`Recipe #${r.mealNumber}: "${r.name}" (Current Food ID: ${r.foodId})`);
  }

  await mongoose.disconnect();
}

mapOriginalImages();
