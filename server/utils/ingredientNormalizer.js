/**
 * Canonical Ingredient Normalization and Stock Status Utility
 */

const CANONICAL_MAPPINGS = {
  'basmati rice': 'basmati rice',
  'biryani masala': 'biryani masala',
  'chana dal': 'chana dal',
  'chilli powder': 'chilli powder',
  'coriander powder': 'coriander powder',
  'cumin': 'cumin / jeera',
  'cumin / jeera': 'cumin / jeera',
  'jeera': 'cumin / jeera',
  'dry red chilli': 'dry red chilli',
  'red chilli': 'dry red chilli',
  'garam masala': 'garam masala',
  'mustard': 'mustard seeds',
  'mustard seeds': 'mustard seeds',
  'moong dal': 'moong dal',
  'green gram/moong dal': 'moong dal',
  'green gram': 'moong dal',
  'rasam powder': 'rasam powder',
  'sambar powder': 'sambar powder',
  'vatha kuzhambu powder': 'sambar powder',
  'sesame seeds': 'sesame seeds',
  'sesame': 'sesame seeds',
  'toor dal': 'toor dal',
  'turmeric': 'turmeric powder',
  'turmeric powder': 'turmeric powder',
  'urad dal': 'urad dal',
  'cooking oil': 'cooking oil',
  'oil': 'cooking oil',
  'raw rice': 'raw rice',
  'rice': 'raw rice',
  'fennel': 'fennel seeds',
  'fennel seeds': 'fennel seeds',
  'fenugreek': 'fenugreek seeds',
  'fenugreek seeds': 'fenugreek seeds',
  'peanut': 'peanuts',
  'peanuts': 'peanuts',
  'tamarind': 'tamarind',
  'jaggery': 'jaggery',
  'sugar': 'sugar',
  'salt': 'salt',
  'pepper': 'pepper',
  'black pepper': 'pepper',
  'cinnamon': 'cinnamon',
  'clove': 'cloves',
  'cloves': 'cloves',
  'cardamom': 'cardamom',
  'appalam': 'appalam',
  'chickpea': 'chickpeas',
  'chickpeas': 'chickpeas',
  'ginger-garlic paste': 'ginger-garlic paste'
};

/**
 * Normalizes an ingredient name to its canonical lowercased identity
 * @param {string} name
 * @returns {string}
 */
export const normalizeIngredientName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return CANONICAL_MAPPINGS[clean] || clean;
};

/**
 * Stock Status Calculator
 * Rule:
 * currentStock > 0 -> in_stock (or low_stock if currentStock <= minStock)
 * currentStock <= 0 -> out_of_stock
 *
 * @param {number} currentStock
 * @param {number} minStock
 * @returns {'in_stock' | 'low_stock' | 'out_of_stock'}
 */
export const determineStockStatus = (currentStock, minStock = 0) => {
  const stock = Number(currentStock) || 0;
  const min = Number(minStock) || 0;

  if (stock <= 0) {
    return 'out_of_stock';
  }
  if (min > 0 && stock <= min) {
    return 'low_stock';
  }
  return 'in_stock';
};
