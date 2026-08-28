import Ingredient from '../models/Ingredient.js';
import { normalizeIngredientName } from '../utils/ingredientNormalizer.js';

/**
 * Checks if two unit strings belong to compatible physical dimensions.
 * Weight: g, gram, grams, kg, kilogram, kilograms
 * Liquid: ml, millilitre, millilitres, l, litre, litres
 * Count: piece, pieces, nos, number, numbers
 */
export const isUnitCompatible = (sourceUnit, targetUnit) => {
  const s = (sourceUnit || '').trim().toLowerCase();
  const t = (targetUnit || '').trim().toLowerCase();
  if (s === t) return true;

  const isWeight = (u) => ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms'].includes(u);
  const isLiquid = (u) => ['ml', 'millilitre', 'millilitres', 'l', 'litre', 'litres'].includes(u);
  const isCount = (u) => ['piece', 'pieces', 'nos', 'number', 'numbers'].includes(u);

  if (isWeight(s) && isWeight(t)) return true;
  if (isLiquid(s) && isLiquid(t)) return true;
  if (isCount(s) && isCount(t)) return true;

  return false;
};

/**
 * Standard unit converter helper for comparing Recipe ingredient units with Inventory storage units.
 * Converts value from sourceUnit to targetUnit if compatible.
 */
export const normalizeToStorageUnit = (qty, sourceUnit, targetUnit) => {
  if (qty == null || isNaN(qty)) return 0;
  const sUnit = (sourceUnit || '').trim().toLowerCase();
  const tUnit = (targetUnit || '').trim().toLowerCase();

  if (sUnit === tUnit) return qty;

  // Grams to Kilograms
  if (['g', 'gram', 'grams'].includes(sUnit) && ['kg', 'kilogram', 'kilograms'].includes(tUnit)) {
    return qty / 1000;
  }
  // Kilograms to Grams
  if (['kg', 'kilogram', 'kilograms'].includes(sUnit) && ['g', 'gram', 'grams'].includes(tUnit)) {
    return qty * 1000;
  }

  // Millilitres to Litres
  if (['ml', 'millilitre', 'millilitres'].includes(sUnit) && ['l', 'litre', 'litres'].includes(tUnit)) {
    return qty / 1000;
  }
  // Litres to Millilitres
  if (['l', 'litre', 'litres'].includes(sUnit) && ['ml', 'millilitre', 'millilitres'].includes(tUnit)) {
    return qty * 1000;
  }

  // Incompatible units return as-is
  return qty;
};

/**
 * Normalizes ingredient name for matching with storage inventory
 */
export const normalizeItemName = (name) => {
  return normalizeIngredientName(name);
};

/**
 * Calculates itemized daily requirements for a given recipe & actual employee count.
 * Formula: Required = (Base Quantity / 10) * Actual Employees
 *
 * @param {Object} recipe - Recipe document or object
 * @param {number} actualEmployees - Number of employees applied
 * @param {Array} storageIngredients - Current inventory list from MongoDB
 */
export const calculateDailyRequirements = (recipe, actualEmployees = 10, storageIngredients = []) => {
  const employees = Math.max(0, Number(actualEmployees) || 0);
  const basePersons = recipe?.basePersons || 10;
  const scalingFactor = employees > 0 ? (employees / basePersons) : 0;

  // Build lookup map for storage items by canonical normalized name and ID
  const storageMap = new Map();
  for (const item of storageIngredients) {
    if (item._id) storageMap.set(item._id.toString(), item);
    if (item.normalizedName) storageMap.set(item.normalizedName, item);
    storageMap.set(normalizeItemName(item.name), item);
    storageMap.set(item.name.toLowerCase(), item);
  }

  const groceryItems = [];
  const freshItems = [];

  const rawIngredients = recipe?.ingredients || [];

  for (const ing of rawIngredients) {
    const rawRequired = scalingFactor * (ing.baseQuantity || 0);
    const roundedRequired = Math.round(rawRequired * 100) / 100;

    const isGrocery = (ing.category === 'grocery');

    if (isGrocery) {
      // 1. GROCERIES / REQUIRED INGREDIENTS
      // Match with storage item via canonical normalized name, lowercased name, or ID
      const normName = normalizeItemName(ing.name);
      const storageItem = storageMap.get(normName) || storageMap.get((ing.name || '').toLowerCase()) || null;

      let currentStorage = storageItem ? (Number(storageItem.currentStock) || 0) : 0;
      let storageUnit = storageItem ? storageItem.defaultUnit : ing.unit;

      // Convert recipe required quantity into storage units for consistent comparison
      const requiredInStorageUnit = Math.round(normalizeToStorageUnit(roundedRequired, ing.unit, storageUnit) * 100) / 100;

      // Shortage = max(Required - Available, 0)
      // Remaining = max(Available - Required, 0)
      const purchaseNeeded = Math.max(0, Math.round((requiredInStorageUnit - currentStorage) * 100) / 100);
      const remainingStock = Math.max(0, Math.round((currentStorage - requiredInStorageUnit) * 100) / 100);

      let status = 'STOCK_SUFFICIENT';
      let statusLabel = 'Stock Sufficient';
      if (roundedRequired === 0 || requiredInStorageUnit === 0) {
        status = 'NOT_REQUIRED_THIS_MONTH';
        statusLabel = 'Not Required';
      } else if (currentStorage >= requiredInStorageUnit) {
        status = 'STOCK_SUFFICIENT';
        statusLabel = 'Stock Sufficient';
      } else {
        status = 'NEED_PURCHASE';
        statusLabel = 'Need Purchase';
      }

      groceryItems.push({
        name: storageItem ? storageItem.name : ing.name,
        name_ta: (storageItem && storageItem.name_ta) ? storageItem.name_ta : (ing.name_ta || ''),
        baseQty: ing.baseQuantity,
        unit: ing.unit,
        requiredQty: roundedRequired,
        currentStorage: currentStorage,
        storageUnit: storageUnit,
        requiredInStorageUnit: requiredInStorageUnit,
        purchaseNeeded: purchaseNeeded,
        remainingStock: remainingStock,
        status,
        statusLabel,
        category: 'grocery',
        ingredientId: storageItem ? storageItem._id : null
      });
    } else {
      // 2. FRESH ITEMS
      // Fresh items (vegetables, meat, dairy, herbs) are required fresh daily and are independent of dry grocery storage.
      // Grocery stock availability never hides or reduces required fresh items.
      const purchaseNeeded = roundedRequired;
      let status = 'STOCK_SUFFICIENT';
      let statusLabel = 'Stock Sufficient';
      if (roundedRequired === 0) {
        status = 'NOT_REQUIRED_THIS_MONTH';
        statusLabel = 'Not Required';
      } else {
        status = 'NEED_PURCHASE';
        statusLabel = 'Fresh Daily Purchase';
      }

      freshItems.push({
        name: ing.name,
        name_ta: ing.name_ta || '',
        baseQty: ing.baseQuantity,
        unit: ing.unit,
        requiredQty: roundedRequired,
        currentStorage: 0,
        storageUnit: ing.unit,
        requiredInStorageUnit: roundedRequired,
        purchaseNeeded: purchaseNeeded,
        remainingStock: 0,
        status,
        statusLabel,
        category: ing.category || 'fresh',
        ingredientId: ing.ingredientId || null
      });
    }
  }

  return {
    actualEmployees: employees,
    basePersons,
    scalingFactor,
    groceryItems,
    freshItems
  };
};
