import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Food from './models/Food.js';

async function inspectOriginals() {
  await connectDB();

  const originalFoods = await Food.find({ 'image.data': { $exists: true, $ne: null } }).sort({ _id: 1 });
  console.log(`Original Foods Count: ${originalFoods.length}`);

  originalFoods.forEach((f, idx) => {
    console.log(`${idx + 1}. "${f.name}" | "${f.name_ta}" | Category: ${f.category} | Type: ${f.foodType} | ID: ${f._id} | Size: ${f.image?.data?.length}`);
  });

  await mongoose.disconnect();
}

inspectOriginals();
