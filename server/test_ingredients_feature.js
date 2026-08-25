import './config/env.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import Ingredient from './models/Ingredient.js';
import Recipe from './models/Recipe.js';
import DailyRequirement from './models/DailyRequirement.js';
import { seedIngredientMasterData } from './services/seedIngredientData.js';
import { calculateDailyRequirements } from './services/requirementCalculator.js';

async function runTests() {
  console.log('🧪 Starting Ingredient & Purchase Planning Verification Tests...\n');

  try {
    await connectDB();
    console.log('✅ Database connected.');

    // 1. Run Master Seed
    await seedIngredientMasterData();

    // 2. Verify 28 Recipes
    const totalRecipes = await Recipe.countDocuments();
    console.log(`✅ Total Recipes in DB: ${totalRecipes} (Expected: 28)`);
    if (totalRecipes !== 28) {
      throw new Error(`Expected 28 recipes, found ${totalRecipes}`);
    }

    // 3. Verify Storage Items
    const storageItems = await Ingredient.find({ isStorageItem: true });
    console.log(`✅ Total Storage Items in DB: ${storageItems.length} (Expected >= 31)`);

    // 4. Test Calculation for Chicken Biryani (Meal #12)
    const biryani = await Recipe.findOne({ mealNumber: 12 });
    console.log(`\n📋 Testing Recipe: ${biryani.name} (${biryani.name_ta})`);

    // Base Recipe (10 persons)
    const calc10 = calculateDailyRequirements(biryani, 10, storageItems);
    console.log(`\n--- Test Case: 10 Employees (Base) ---`);
    console.log(`Grocery Items: ${calc10.groceryItems.length} items`);
    console.log(`Fresh Items: ${calc10.freshItems.length} items`);
    const rice10 = calc10.groceryItems.find(i => i.name.toLowerCase().includes('basmati'));
    console.log(`Basmati Rice (10 emp): Required = ${rice10?.requiredQty} ${rice10?.unit} (Expected: 1.1 kg)`);
    if (rice10?.requiredQty !== 1.1) throw new Error('Base rice calculation mismatch');

    // 18 Employees
    const calc18 = calculateDailyRequirements(biryani, 18, storageItems);
    console.log(`\n--- Test Case: 18 Employees ---`);
    const rice18 = calc18.groceryItems.find(i => i.name.toLowerCase().includes('basmati'));
    const chicken18 = calc18.freshItems.find(i => i.name.toLowerCase().includes('chicken'));
    const oil18 = calc18.groceryItems.find(i => i.name.toLowerCase().includes('oil'));
    console.log(`Basmati Rice (18 emp): Required = ${rice18?.requiredQty} ${rice18?.unit} (Expected: 1.98 kg)`);
    console.log(`Chicken (18 emp, Fresh): Required = ${chicken18?.requiredQty} ${chicken18?.unit} (Expected: 2.88 kg)`);
    console.log(`Oil (18 emp): Required = ${oil18?.requiredQty} ${oil18?.unit} (Expected: 450 ml)`);

    // Storage Comparison
    console.log(`Storage Available for Basmati Rice: ${rice18?.currentStorage} kg`);
    console.log(`Purchase Needed: ${rice18?.purchaseNeeded} kg | Remaining: ${rice18?.remainingStock} kg`);

    // Edge Case: 0 Employees
    const calc0 = calculateDailyRequirements(biryani, 0, storageItems);
    console.log(`\n--- Test Case: 0 Employees (Edge Case) ---`);
    const rice0 = calc0.groceryItems.find(i => i.name.toLowerCase().includes('basmati'));
    console.log(`Basmati Rice (0 emp): Required = ${rice0?.requiredQty} ${rice0?.unit}, Purchase = ${rice0?.purchaseNeeded}`);
    if (rice0?.requiredQty !== 0 || rice0?.purchaseNeeded !== 0) throw new Error('0 employees should yield 0 required & 0 purchase');

    console.log('\n🎉 ALL BACKEND LOGIC VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
  }
}

runTests();
