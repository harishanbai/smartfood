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
    let menu = await Menu.findOne({ date, status: 'active' })
      .populate('foodId', '-image.data')
      .populate('vegFoodId', '-image.data')
      .populate('nonVegFoodId', '-image.data');

    if (!menu) {
      menu = await Menu.findOne({ date })
        .populate('foodId', '-image.data')
        .populate('vegFoodId', '-image.data')
        .populate('nonVegFoodId', '-image.data');
    }

    const [savedDoc, storageIngredients] = await Promise.all([
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
    if (employeeParam !== undefined && employeeParam !== '' && Number(employeeParam) >= 0) {
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

    const isDeductedForCurrent = Boolean(
      savedDoc &&
      savedDoc.isStockDeducted &&
      savedDoc.deductedEmployees === actualEmployees &&
      (savedDoc.deductedMealNumber == null || savedDoc.deductedMealNumber === recipe.mealNumber)
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
      isStockDeducted: isDeductedForCurrent,
      deductedEmployees: savedDoc ? (savedDoc.deductedEmployees || (savedDoc.isStockDeducted ? savedDoc.actualEmployees : 0)) : 0,
      deductedMealNumber: savedDoc ? savedDoc.deductedMealNumber : null,
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

    const existingDoc = await DailyRequirement.findOne({ date });
    const isSameDeductedState = Boolean(
      existingDoc &&
      existingDoc.isStockDeducted &&
      existingDoc.deductedEmployees === employees &&
      (existingDoc.deductedMealNumber == null || existingDoc.deductedMealNumber === recipe.mealNumber)
    );

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
        isStockDeducted: isSameDeductedState,
        deductedEmployees: existingDoc?.deductedEmployees || 0,
        deductedMealNumber: existingDoc?.deductedMealNumber || null,
        deductedAt: isSameDeductedState ? existingDoc.deductedAt : null,
        notes: notes || existingDoc?.notes || ''
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
 * Confirms lunch preparation and permanently deducts grocery storage quantities with delta reconciliation
 */
export const confirmStockDeduction = async (req, res) => {
  try {
    const { date, actualEmployees, mealNumber } = req.body;
    const targetDate = date || getKolkataDateStr(0);
    const lang = req.headers['accept-language'] || 'en';

    const holiday = await Holiday.findOne({ date: targetDate, status: 'HOLIDAY' });
    if (holiday) {
      return res.status(400).json({ message: 'Cannot deduct stock on a holiday' });
    }

    let dailyDoc = await DailyRequirement.findOne({ date: targetDate });

    let recipe = null;
    const requestedMeal = mealNumber || dailyDoc?.mealNumber;
    if (requestedMeal) {
      recipe = await Recipe.findOne({ mealNumber: Number(requestedMeal) });
    }
    if (!recipe) {
      const menu = await Menu.findOne({ date: targetDate, status: 'active' }).populate('foodId vegFoodId nonVegFoodId');
      const foodItem = menu?.foodId || menu?.vegFoodId || menu?.nonVegFoodId;
      recipe = await findRecipeForFood(foodItem) || await Recipe.findOne({ mealNumber: 1 });
    }

    const currentEmployees = actualEmployees != null ? Math.max(0, Number(actualEmployees)) : (dailyDoc?.actualEmployees || 10);
    
    // Check if previously deducted for this date and same dish
    const prevDeducted = Boolean(dailyDoc && dailyDoc.isStockDeducted && (dailyDoc.deductedMealNumber == null || dailyDoc.deductedMealNumber === recipe.mealNumber));
    const prevDeductedCount = prevDeducted ? (dailyDoc.deductedEmployees || dailyDoc.actualEmployees || 0) : 0;

    const deltaEmployees = currentEmployees - prevDeductedCount;

    if (deltaEmployees === 0 && prevDeducted) {
      return res.json({
        success: true,
        message: `Stock has already been deducted for ${currentEmployees} employees on this date.`,
        dailyDoc: translateResponse(dailyDoc, lang),
        transactionsCount: 0
      });
    }

    // Delta scaling factor for base proportion (10 persons)
    const basePersons = recipe?.basePersons || 10;
    const deltaScaling = deltaEmployees / basePersons;

    const transactions = [];
    const rawIngredients = recipe?.ingredients || [];

    for (const ing of rawIngredients) {
      if (ing.category === 'grocery') {
        const normName = normalizeItemName(ing.name);
        const escapedName = ing.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const item = await Ingredient.findOne({
          $or: [
            { normalizedName: normName },
            { name: { $regex: new RegExp(`^${escapedName}$`, 'i') } }
          ]
        });

        if (item) {
          const deltaRaw = deltaScaling * (ing.baseQuantity || 0);
          const deltaInStorageUnit = Math.round(normalizeToStorageUnit(deltaRaw, ing.unit, item.defaultUnit) * 100) / 100;

          if (deltaInStorageUnit !== 0) {
            const prev = item.currentStock;
            let nextStock = prev;
            let txType = 'usage_deduction';
            let txQty = Math.abs(deltaInStorageUnit);
            let notes = '';

            if (deltaInStorageUnit > 0) {
              // Deduct additional stock
              nextStock = Math.max(0, Math.round((prev - deltaInStorageUnit) * 100) / 100);
              txType = 'usage_deduction';
              notes = prevDeductedCount > 0
                ? `Incremental deduction for extra ${deltaEmployees} employees (${prevDeductedCount} → ${currentEmployees}) on ${targetDate} lunch (${recipe.name})`
                : `Auto deduction for ${targetDate} lunch (${currentEmployees} employees, ${recipe.name})`;
            } else {
              // Reconcile/refund excess stock for reduced employee count
              nextStock = Math.round((prev + txQty) * 100) / 100;
              txType = 'manual_adjustment';
              notes = `Stock adjustment for reduced count (${prevDeductedCount} → ${currentEmployees} employees) on ${targetDate} lunch (${recipe.name})`;
            }

            item.currentStock = nextStock;
            item.lastUpdated = new Date();
            await item.save();

            transactions.push({
              ingredientId: item._id,
              ingredientName: item.name,
              type: txType,
              quantity: txQty,
              unit: item.defaultUnit,
              previousStock: prev,
              newStock: nextStock,
              referenceDate: targetDate,
              notes
            });
          }
        }
      }
    }

    if (transactions.length > 0) {
      await StockTransaction.insertMany(transactions);
    }

    const storageIngredients = await Ingredient.find({});
    const calcResult = calculateDailyRequirements(recipe, currentEmployees, storageIngredients);

    // Update DailyRequirement record with confirmed status
    dailyDoc = await DailyRequirement.findOneAndUpdate(
      { date: targetDate },
      {
        date: targetDate,
        mealNumber: recipe.mealNumber,
        recipeId: recipe._id,
        dishName: recipe.name,
        dishNameTa: recipe.name_ta,
        foodType: recipe.foodType,
        actualEmployees: currentEmployees,
        basePersons: 10,
        groceryItems: calcResult.groceryItems,
        freshItems: calcResult.freshItems,
        isStockDeducted: true,
        deductedEmployees: currentEmployees,
        deductedMealNumber: recipe.mealNumber,
        deductedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: prevDeductedCount > 0
        ? `Storage stock adjusted for ${currentEmployees} employees (previously ${prevDeductedCount})!`
        : `Storage stock deducted successfully for ${currentEmployees} employees!`,
      dailyDoc: translateResponse(dailyDoc, lang),
      transactionsCount: transactions.length
    });
  } catch (error) {
    console.error('Error confirming stock deduction:', error);
    res.status(500).json({ message: 'Error confirming stock deduction', error: error.message });
  }
};
