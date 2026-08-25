import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Food from './models/Food.js';
import Recipe from './models/Recipe.js';

// Exact mapping from 28 Meals to the 28 Original Food IDs with User's Binary Images
const MEAL_TO_ORIGINAL_FOOD_ID = {
  1: '6a8d6d90cf9d09d5c22b2b46', // Veg Biryani
  2: '6a5f6661a064b1b6721b62b2', // Lemon Rice
  3: '6a5f6661a064b1b6721b62b4', // Sambar Rice
  4: '6a5f6661a064b1b6721b62b6', // Chicken Curry
  5: '6a5f6661a064b1b6721b62b8', // Brinji Rice
  6: '6a5f6661a064b1b6721b62ba', // Vatha Kuzhambu
  7: '6a5f6661a064b1b6721b62bc', // Sambar (with Egg Masala / Appalam)
  8: '6a5f6661a064b1b6721b62be', // Kurma Kuzhambu
  9: '6a5f6661a064b1b6721b62c0', // Tomato Rice
  10: '6a5f6661a064b1b6721b62c2', // Urundai Kuzhambu
  11: '6a5f6661a064b1b6721b62c4', // Mor Kuzhambu
  12: '6a5f6662a064b1b6721b62c6', // Chicken Biryani
  13: '6a5f6662a064b1b6721b62c8', // Sambar with rice
  14: '6a5f6662a064b1b6721b62ca', // Rasam Rice
  15: '6a5f6662a064b1b6721b62cc', // Vatha Kuzhambu
  16: '6a5f6662a064b1b6721b62ce', // Coconut Rice
  17: '6a5f6662a064b1b6721b62d0', // Tamarind Rice (Puli Sadham)
  18: '6a5f6662a064b1b6721b62d2', // Chicken Curry
  19: '6a5f6662a064b1b6721b62d4', // Sambar Rice
  20: '6a5f6662a064b1b6721b62d6', // Kuska
  21: '6a5f6662a064b1b6721b62d8', // Egg Curry
  22: '6a5f6662a064b1b6721b62da', // Puli Kuzhambu
  23: '6a5f6662a064b1b6721b62dc', // Chicken Curry1
  24: '6a5f6662a064b1b6721b62de', // Lemon Rice
  25: '6a5f6662a064b1b6721b62e0', // Urundai Kuzhambu
  26: '6a5f6662a064b1b6721b62e2', // Kadalai Kurma
  27: '6a5f6662a064b1b6721b62e4', // Lemon Rice Combo
  28: '6a5f6662a064b1b6721b62e6'  // Coconut Milk Rice
};

async function restoreOriginalImages() {
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  // 1. Delete all duplicate food documents that have no binary image data
  const deleteResult = await Food.deleteMany({
    $or: [
      { 'image.data': { $exists: false } },
      { 'image.data': null }
    ]
  });
  console.log(`🗑️ Deleted ${deleteResult.deletedCount} duplicate food items that had no binary images.`);

  // 2. Clear any imageUrl fields from original foods
  await Food.updateMany(
    {},
    { $unset: { imageUrl: 1 } }
  );
  console.log('🧹 Cleaned up mock imageUrl fields.');

  // 3. Repoint all 28 Recipe documents to the original Food documents with binary images
  for (let mealNum = 1; mealNum <= 28; mealNum++) {
    const foodId = MEAL_TO_ORIGINAL_FOOD_ID[mealNum];
    if (foodId) {
      await Recipe.findOneAndUpdate(
        { mealNumber: mealNum },
        { $set: { foodId: new mongoose.Types.ObjectId(foodId) } }
      );
      console.log(`✅ Recipe #${mealNum} linked to original Food ID: ${foodId}`);
    }
  }

  // 4. Verify remaining foods
  const remainingFoods = await Food.find({});
  console.log(`\n🎉 Done! Total Food items remaining in MongoDB: ${remainingFoods.length}`);
  remainingFoods.forEach((f, idx) => {
    console.log(`${idx + 1}. "${f.name}" (${f.name_ta}) [ID: ${f._id}] -> Binary Image: ${f.image?.data?.length} bytes (${f.image?.contentType})`);
  });

  await mongoose.disconnect();
}

restoreOriginalImages();
