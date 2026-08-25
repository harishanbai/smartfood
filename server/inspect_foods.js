import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Food from './models/Food.js';

async function inspectFoodImages() {
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  const allFoods = await Food.find({});
  console.log(`Total Food documents: ${allFoods.length}\n`);

  let withBinaryImage = 0;
  let withoutBinaryImage = 0;

  for (const food of allFoods) {
    const hasBinary = food.image && food.image.data && food.image.data.length > 0;
    const binarySize = hasBinary ? food.image.data.length : 0;
    const contentType = food.image?.contentType || 'none';
    if (hasBinary) {
      withBinaryImage++;
      console.log(`[BINARY IMAGE] "${food.name}" (_id: ${food._id}) -> Size: ${binarySize} bytes, Type: ${contentType}`);
    } else {
      withoutBinaryImage++;
      console.log(`[NO BINARY] "${food.name}" (_id: ${food._id}) -> imageUrl: ${food.imageUrl || 'none'}`);
    }
  }

  console.log(`\nSummary: ${withBinaryImage} foods have binary image data stored in MongoDB. ${withoutBinaryImage} do not.`);
  await mongoose.disconnect();
}

inspectFoodImages();
