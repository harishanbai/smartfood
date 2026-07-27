import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from './models/Food.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_lunch';
console.log('Connecting to', uri);

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');
    
    const foods = await Food.find({});
    console.log(`Found ${foods.length} food items.`);
    if (foods.length > 0) {
      const firstFood = foods[0];
      console.log(`Attempting to delete food item: ${firstFood.name} (${firstFood._id})`);
      
      const deleted = await Food.findByIdAndDelete(firstFood._id);
      console.log('Deleted food item result:', deleted);
    } else {
      console.log('No food items to delete.');
    }
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
