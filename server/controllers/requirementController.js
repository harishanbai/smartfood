import Menu from '../models/Menu.js';
import Food from '../models/Food.js';
import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import DailyRequirement from '../models/DailyRequirement.js';
import StockTransaction from '../models/StockTransaction.js';
import Holiday from '../models/Holiday.js';
import { calculateDailyRequirements, normalizeItemName, normalizeToStorageUnit } from '../services/requirementCalculator.js';
import { getKolkataDateStr } from '../utils/dateUtils.js';
import { translateResponse } from '../utils/translator.js';

/**
 * Helper to get matching recipe for a menu or food item
 */
const findRecipeForFood = async (foodDoc) => {
  if (!foodDoc) return null;

  // 1. Match by direct foodId reference
  let recipe = await Recipe.findOne({ foodId: foodDoc._id });
  if (recipe) return recipe;

  // 2. Match by exact name or name_ta
  recipe = await Recipe.findOne({
    $or: [
      { name: foodDoc.name },
      { name_ta: foodDoc.name_ta },
      { name: { $regex: foodDoc.name.split(',')[0].trim(), $options: 'i' } }
    ]
  });
  if (recipe) return recipe;

  // 3. Match by keyword (e.g. biryani, sambar, vatha, lemon)
  const nameLow = (foodDoc.name || '').toLowerCase();
  const allRecipes = await Recipe.find({ isActive: true });
  for (const r of allRecipes) {
    const rName = r.name.toLowerCase();
    if (nameLow.includes('biryani') && rName.includes('biryani')) return r;
    if (nameLow.includes('sambar') && rName.includes('sambar')) return r;
    if (nameLow.includes('lemon') && rName.includes('lemon')) return r;
    if (nameLow.includes('chicken') && rName.includes('chicken')) return r;
    if (nameLow.includes('kurma') && rName.includes('kurma')) return r;
    if (nameLow.includes('vatha') && rName.includes('vatha')) return r;
  }

  // Fallback to Recipe #1 if no matching recipe
  return allRecipes[0] || null;
};

/**
 * GET /api/requirements/daily
 * Calculates requirements for a specific date and employee count
 */
export const getDailyRequirement = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const date = req.query.date || getKolkataDateStr(0);
    const employeeParam = req.query.employees;

    // 1. Check if date is a Holiday
    const holiday = await Holiday.findOne({ date, status: 'HOLIDAY' });
    if (holiday) {
      return res.json(translateResponse({
        date,
        isHoliday: true,
        holiday: {
          name: holiday.name || 'Holiday',
          name_ta: holiday.name_ta || 'விடுமுறை',
          notes: holiday.notes || ''
        },
        hasMenu: false,
        menuId: null,
        dish: null,
        actualEmployees: 0,
        basePersons: 10,
        groceryItems: [],
        freshItems: [],
        purchaseList: [],
        isStockDeducted: false,
        deductedAt: null,
        notes: holiday.name || 'Holiday'
      }, lang));
    }

    // 2. Fetch active menu, saved DailyRequirement, and grocery storage inventory concurrently
    const [menu, savedDoc, storageIngredients] = await Promise.all([
      Menu.findOne({ date, status: 'active' })
        .populate('foodId', '-image.data')
        .populate('vegFoodId', '-image.data')
        .populate('nonVegFoodId', '-image.data'),
      DailyRequirement.findOne({ date }),
      Ingredient.find({})
    ]);

    const foodItem = menu?.foodId || menu?.vegFoodId || menu?.nonVegFoodId || null;

    // 2. Find recipe
    let recipe = null;
    if (req.query.mealNumber) {
      recipe = await Recipe.findOne({ mealNumber: Number(req.query.mealNumber) });
    }
    if (!recipe && foodItem) {
      recipe = await findRecipeForFood(foodItem);
    }
    if (!recipe) {
      recipe = await Recipe.findOne({ mealNumber: 1 });
    }

    // 3. Resolve employee count & stock deduction status
    let actualEmployees = 10;
    if (employeeParam !== undefined && employeeParam !== '') {
      actualEmployees = Math.max(0, Number(employeeParam));
    } else if (savedDoc && savedDoc.actualEmployees > 0) {
      actualEmployees = savedDoc.actualEmployees;
    }

    // 4. Run calculation
    const calcResult = calculateDailyRequirements(recipe, actualEmployees, storageIngredients);

    // 5. Build purchase list: all items (grocery & fresh) where purchaseNeeded > 0
    const purchaseList = [...calcResult.groceryItems, ...calcResult.freshItems].filter(
      item => (Number(item.purchaseNeeded) || 0) > 0 && (Number(item.requiredQty) || 0) > 0
    );

    const responseData = {
      date,
      hasMenu: !!menu,
      menuId: menu?._id || null,
      dish: {
        id: recipe?._id,
        mealNumber: recipe?.mealNumber || 1,
        name: recipe?.name || foodItem?.name || 'Standard Lunch Menu',
        name_ta: recipe?.name_ta || foodItem?.name_ta || 'மதிய உணவு மெனு',
        foodType: recipe?.foodType || foodItem?.foodType || 'veg',
        category: recipe?.category || foodItem?.category || 'Main Course',
        description: recipe?.description || foodItem?.description || '',
      },
      actualEmployees,
      basePersons: 10,
      groceryItems: calcResult.groceryItems,
      freshItems: calcResult.freshItems,
      purchaseList,
      isStockDeducted: savedDoc ? savedDoc.isStockDeducted : false,
      deductedAt: savedDoc ? savedDoc.deductedAt : null,
      notes: savedDoc ? savedDoc.notes : ''
    };

    res.json(translateResponse(responseData, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error calculating daily requirement', error: error.message });
  }
};

/**
 * POST /api/requirements/daily/save
 * Persists employee count and requirement calculations for a day
 */
export const saveDailyRequirement = async (req, res) => {
  try {
    const { date, actualEmployees, mealNumber, notes } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const holiday = await Holiday.findOne({ date, status: 'HOLIDAY' });
    if (holiday) {
      return res.status(400).json({ message: 'Cannot save employee count on a holiday' });
    }

    let recipe = null;
    if (mealNumber) {
      recipe = await Recipe.findOne({ mealNumber: Number(mealNumber) });
    }
    if (!recipe) {
      const menu = await Menu.findOne({ date, status: 'active' }).populate('foodId vegFoodId nonVegFoodId');
      const foodItem = menu?.foodId || menu?.vegFoodId || menu?.nonVegFoodId;
      recipe = await findRecipeForFood(foodItem) || await Recipe.findOne({ mealNumber: 1 });
    }

    const storageIngredients = await Ingredient.find({});
    const employees = Math.max(0, Number(actualEmployees) || 0);
    const calcResult = calculateDailyRequirements(recipe, employees, storageIngredients);

    const updatedDoc = await DailyRequirement.findOneAndUpdate(
      { date },
      {
        date,
        mealNumber: recipe.mealNumber,
        recipeId: recipe._id,
        dishName: recipe.name,
        dishNameTa: recipe.name_ta,
        foodType: recipe.foodType,
        actualEmployees: employees,
        basePersons: 10,
        groceryItems: calcResult.groceryItems,
        freshItems: calcResult.freshItems,
        notes: notes || ''
      },
      { upsert: true, new: true }
    );

    res.json(translateResponse(updatedDoc, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error saving daily requirement', error: error.message });
  }
};

/**
 * POST /api/requirements/daily/deduct-stock
 * Confirms lunch preparation and permanently deducts grocery storage quantities
 */
export const confirmStockDeduction = async (req, res) => {
  try {
    const { date, actualEmployees } = req.body;
    const targetDate = date || getKolkataDateStr(0);
    const lang = req.headers['accept-language'] || 'en';

    const holiday = await Holiday.findOne({ date: targetDate, status: 'HOLIDAY' });
    if (holiday) {
      return res.status(400).json({ message: 'Cannot deduct stock on a holiday' });
    }

    let dailyDoc = await DailyRequirement.findOne({ date: targetDate });

    let recipe = null;
    if (dailyDoc?.mealNumber) {
      recipe = await Recipe.findOne({ mealNumber: dailyDoc.mealNumber });
    }
    if (!recipe) {
      const menu = await Menu.findOne({ date: targetDate, status: 'active' }).populate('foodId vegFoodId nonVegFoodId');
      const foodItem = menu?.foodId || menu?.vegFoodId || menu?.nonVegFoodId;
      recipe = await findRecipeForFood(foodItem) || await Recipe.findOne({ mealNumber: 1 });
    }

    const employees = actualEmployees != null ? Math.max(0, Number(actualEmployees)) : (dailyDoc?.actualEmployees || 10);
    const storageIngredients = await Ingredient.find({});
    const calcResult = calculateDailyRequirements(recipe, employees, storageIngredients);

    // If already deducted, alert to prevent duplicate reduction
    if (dailyDoc && dailyDoc.isStockDeducted) {
      return res.status(400).json({
        message: 'Storage inventory has already been deducted for this lunch date.',
        deductedAt: dailyDoc.deductedAt
      });
    }

    // Deduct each grocery item from MongoDB inventory
    const transactions = [];
    for (const gItem of calcResult.groceryItems) {
      if (gItem.ingredientId && gItem.requiredInStorageUnit > 0) {
        const item = await Ingredient.findById(gItem.ingredientId);
        if (item) {
          const prev = item.currentStock;
          const deductedQty = gItem.requiredInStorageUnit;
          const nextStock = Math.max(0, Math.round((prev - deductedQty) * 100) / 100);

          item.currentStock = nextStock;
          item.lastUpdated = new Date();
          await item.save();

          transactions.push({
            ingredientId: item._id,
            ingredientName: item.name,
            type: 'usage_deduction',
            quantity: deductedQty,
            unit: item.defaultUnit,
            previousStock: prev,
            newStock: nextStock,
            referenceDate: targetDate,
            notes: `Auto deduction for ${targetDate} lunch (${employees} employees, ${recipe.name})`
          });
        }
      }
    }

    if (transactions.length > 0) {
      await StockTransaction.insertMany(transactions);
    }

    // Update DailyRequirement record
    dailyDoc = await DailyRequirement.findOneAndUpdate(
      { date: targetDate },
      {
        date: targetDate,
        mealNumber: recipe.mealNumber,
        recipeId: recipe._id,
        dishName: recipe.name,
        dishNameTa: recipe.name_ta,
        foodType: recipe.foodType,
        actualEmployees: employees,
        basePersons: 10,
        groceryItems: calcResult.groceryItems,
        freshItems: calcResult.freshItems,
        isStockDeducted: true,
        deductedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Storage stock updated and deducted successfully!',
      dailyDoc: translateResponse(dailyDoc, lang),
      transactionsCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming stock deduction', error: error.message });
  }
};
