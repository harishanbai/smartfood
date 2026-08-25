import Ingredient from '../models/Ingredient.js';
import StockTransaction from '../models/StockTransaction.js';
import { translateResponse } from '../utils/translator.js';
import { normalizeIngredientName, determineStockStatus } from '../utils/ingredientNormalizer.js';

/**
 * GET /api/ingredients
 * Retrieves all ingredients with optional category/search filters
 */
export const getIngredients = async (req, res) => {
  try {
    const { category, search, storageOnly } = req.query;
    const lang = req.headers['accept-language'] || 'en';

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (storageOnly === 'true') {
      query.isStorageItem = true;
    }
    if (search && search.trim()) {
      const regex = search.trim();
      query.$or = [
        { name: { $regex: regex, $options: 'i' } },
        { name_ta: { $regex: regex, $options: 'i' } }
      ];
    }

    const items = await Ingredient.find(query).sort({ isStorageItem: -1, name: 1 });
    res.json(translateResponse(items, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving ingredients', error: error.message });
  }
};

/**
 * GET /api/ingredients/storage
 * Retrieves grocery storage inventory with stock health statuses
 */
export const getStorageInventory = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const items = await Ingredient.find({ isStorageItem: true }).sort({ name: 1 });

    const inventory = items.map(item => {
      const status = determineStockStatus(item.currentStock, item.minStock);

      return {
        _id: item._id,
        name: item.name,
        normalizedName: item.normalizedName,
        name_ta: item.name_ta,
        category: item.category,
        defaultUnit: item.defaultUnit,
        currentStock: item.currentStock,
        minStock: item.minStock,
        suggestedStorageStock: item.suggestedStorageStock,
        status,
        lastUpdated: item.lastUpdated || item.updatedAt
      };
    });

    const summary = {
      totalItems: inventory.length,
      inStockCount: inventory.filter(i => i.currentStock > 0).length,
      lowStockCount: inventory.filter(i => i.status === 'low_stock').length,
      outOfStockCount: inventory.filter(i => i.currentStock <= 0).length,
    };

    res.json(translateResponse({ summary, items: inventory }, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving storage inventory', error: error.message });
  }
};

/**
 * POST /api/ingredients
 * Add a new ingredient or storage item
 */
export const addIngredient = async (req, res) => {
  try {
    const { name, name_ta, category, defaultUnit, currentStock, minStock, suggestedStorageStock, isStorageItem } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    if (!name || !defaultUnit) {
      return res.status(400).json({ message: 'Name and default unit are required.' });
    }

    const normName = normalizeIngredientName(name);
    const existing = await Ingredient.findOne({ normalizedName: normName });
    if (existing) {
      return res.status(409).json({ message: 'An ingredient with this name already exists.', existingItem: existing });
    }

    const item = new Ingredient({
      name: name.trim(),
      normalizedName: normName,
      name_ta: (name_ta || '').trim(),
      category: category || 'grocery',
      defaultUnit: (defaultUnit || 'kg').trim(),
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
      suggestedStorageStock: Number(suggestedStorageStock) || Number(currentStock) || 0,
      isStorageItem: isStorageItem !== undefined ? Boolean(isStorageItem) : (category === 'grocery')
    });

    await item.save();

    if (item.currentStock > 0) {
      await StockTransaction.create({
        ingredientId: item._id,
        ingredientName: item.name,
        type: 'stock_addition',
        quantity: item.currentStock,
        unit: item.defaultUnit,
        previousStock: 0,
        newStock: item.currentStock,
        notes: 'Initial stock setup'
      });
    }

    res.status(201).json(translateResponse(item, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error creating ingredient', error: error.message });
  }
};

/**
 * PUT /api/ingredients/:id/stock
 * Adjust or update current stock for an ingredient
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, amount, newStock, minStock, suggestedStorageStock, notes } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    const item = await Ingredient.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    const prev = item.currentStock;
    let target = prev;
    let transactionType = 'manual_adjustment';
    let qtyChange = 0;

    if (action === 'add' && amount != null) {
      qtyChange = Math.max(0, Number(amount) || 0);
      target = prev + qtyChange;
      transactionType = 'stock_addition';
    } else if (action === 'deduct' && amount != null) {
      qtyChange = Math.max(0, Number(amount) || 0);
      target = Math.max(0, prev - qtyChange);
      transactionType = 'usage_deduction';
    } else if (newStock != null) {
      target = Math.max(0, Number(newStock) || 0);
      qtyChange = Math.abs(target - prev);
      transactionType = 'manual_adjustment';
    }

    item.currentStock = Math.round(target * 100) / 100;
    if (minStock != null) item.minStock = Math.max(0, Number(minStock) || 0);
    if (suggestedStorageStock != null) item.suggestedStorageStock = Math.max(0, Number(suggestedStorageStock) || 0);
    item.lastUpdated = new Date();

    await item.save();

    await StockTransaction.create({
      ingredientId: item._id,
      ingredientName: item.name,
      type: transactionType,
      quantity: Math.round(qtyChange * 100) / 100,
      unit: item.defaultUnit,
      previousStock: prev,
      newStock: item.currentStock,
      notes: notes || `Stock updated via admin: ${transactionType}`
    });

    res.json(translateResponse(item, lang));
  } catch (error) {
    res.status(500).json({ message: 'Error updating ingredient stock', error: error.message });
  }
};

/**
 * GET /api/ingredients/transactions
 * Get stock audit transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const { ingredientId, limit = 50 } = req.query;
    let query = {};
    if (ingredientId) query.ingredientId = ingredientId;

    const txs = await StockTransaction.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stock transactions', error: error.message });
  }
};
