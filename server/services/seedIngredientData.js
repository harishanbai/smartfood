import mongoose from 'mongoose';
import Ingredient from '../models/Ingredient.js';
import Recipe from '../models/Recipe.js';
import Food from '../models/Food.js';
import StockTransaction from '../models/StockTransaction.js';
import { normalizeIngredientName } from '../utils/ingredientNormalizer.js';

export const SUGGESTED_STORAGE_STOCK = [
  { name: 'Raw Rice', name_ta: 'பச்சரிசி / புழுங்கல் அரிசி', defaultUnit: 'kg', suggestedStorageStock: 30, minStock: 10, currentStock: 30, isStorageItem: true, category: 'grocery' },
  { name: 'Basmati Rice', name_ta: 'பாசுமதி அரிசி', defaultUnit: 'kg', suggestedStorageStock: 5, minStock: 2, currentStock: 5, isStorageItem: true, category: 'grocery' },
  { name: 'Toor Dal', name_ta: 'துவரம் பருப்பு', defaultUnit: 'kg', suggestedStorageStock: 5, minStock: 1.5, currentStock: 5, isStorageItem: true, category: 'grocery' },
  { name: 'Chana Dal', name_ta: 'கடலைப் பருப்பு', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Urad Dal', name_ta: 'உளுத்தம் பருப்பு', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Moong Dal', name_ta: 'பாசிப் பருப்பு', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', defaultUnit: 'kg', suggestedStorageStock: 3, minStock: 1, currentStock: 3, isStorageItem: true, category: 'grocery' },
  { name: 'Peanuts', name_ta: 'வேர்க்கடலை', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Sesame Seeds', name_ta: 'எள்ளு', defaultUnit: 'g', suggestedStorageStock: 500, minStock: 100, currentStock: 500, isStorageItem: true, category: 'grocery' },
  { name: 'Tamarind', name_ta: 'புளி', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Jaggery', name_ta: 'வெல்லம்', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Sugar', name_ta: 'சர்க்கரை', defaultUnit: 'kg', suggestedStorageStock: 2, minStock: 0.5, currentStock: 2, isStorageItem: true, category: 'grocery' },
  { name: 'Cooking Oil', name_ta: 'சமையல் எண்ணெய்', defaultUnit: 'L', suggestedStorageStock: 10, minStock: 3, currentStock: 10, isStorageItem: true, category: 'grocery' },
  { name: 'Salt', name_ta: 'உப்பு', defaultUnit: 'kg', suggestedStorageStock: 3, minStock: 1, currentStock: 3, isStorageItem: true, category: 'grocery' },
  { name: 'Sambar Powder', name_ta: 'சாம்பார் தூள்', defaultUnit: 'kg', suggestedStorageStock: 1.5, minStock: 0.3, currentStock: 1.5, isStorageItem: true, category: 'grocery' },
  { name: 'Rasam Powder', name_ta: 'ரசம் தூள்', defaultUnit: 'g', suggestedStorageStock: 750, minStock: 200, currentStock: 750, isStorageItem: true, category: 'grocery' },
  { name: 'Chilli Powder', name_ta: 'மிளகாய் தூள்', defaultUnit: 'kg', suggestedStorageStock: 1, minStock: 0.25, currentStock: 1, isStorageItem: true, category: 'grocery' },
  { name: 'Coriander Powder', name_ta: 'மல்லித் தூள்', defaultUnit: 'kg', suggestedStorageStock: 1, minStock: 0.25, currentStock: 1, isStorageItem: true, category: 'grocery' },
  { name: 'Turmeric Powder', name_ta: 'மஞ்சள் தூள்', defaultUnit: 'g', suggestedStorageStock: 300, minStock: 50, currentStock: 300, isStorageItem: true, category: 'grocery' },
  { name: 'Garam Masala', name_ta: 'கரம் மசாலா', defaultUnit: 'g', suggestedStorageStock: 300, minStock: 50, currentStock: 300, isStorageItem: true, category: 'grocery' },
  { name: 'Biryani Masala', name_ta: 'பிரியாணி மசாலா', defaultUnit: 'g', suggestedStorageStock: 500, minStock: 100, currentStock: 500, isStorageItem: true, category: 'grocery' },
  { name: 'Pepper', name_ta: 'மிளகு', defaultUnit: 'g', suggestedStorageStock: 250, minStock: 50, currentStock: 250, isStorageItem: true, category: 'grocery' },
  { name: 'Cumin / Jeera', name_ta: 'சீரகம்', defaultUnit: 'g', suggestedStorageStock: 500, minStock: 100, currentStock: 500, isStorageItem: true, category: 'grocery' },
  { name: 'Mustard Seeds', name_ta: 'கடுகு', defaultUnit: 'g', suggestedStorageStock: 500, minStock: 100, currentStock: 500, isStorageItem: true, category: 'grocery' },
  { name: 'Fennel Seeds', name_ta: 'சோம்பு', defaultUnit: 'g', suggestedStorageStock: 250, minStock: 50, currentStock: 250, isStorageItem: true, category: 'grocery' },
  { name: 'Fenugreek Seeds', name_ta: 'வெந்தயம்', defaultUnit: 'g', suggestedStorageStock: 100, minStock: 25, currentStock: 100, isStorageItem: true, category: 'grocery' },
  { name: 'Dry Red Chilli', name_ta: 'வரமிளகாய்', defaultUnit: 'g', suggestedStorageStock: 500, minStock: 100, currentStock: 500, isStorageItem: true, category: 'grocery' },
  { name: 'Cinnamon', name_ta: 'பட்டை', defaultUnit: 'g', suggestedStorageStock: 200, minStock: 50, currentStock: 200, isStorageItem: true, category: 'grocery' },
  { name: 'Cloves', name_ta: 'கிராம்பு', defaultUnit: 'g', suggestedStorageStock: 100, minStock: 25, currentStock: 100, isStorageItem: true, category: 'grocery' },
  { name: 'Cardamom', name_ta: 'ஏலக்காய்', defaultUnit: 'g', suggestedStorageStock: 100, minStock: 25, currentStock: 100, isStorageItem: true, category: 'grocery' },
  { name: 'Appalam', name_ta: 'அப்பளம்', defaultUnit: 'pieces', suggestedStorageStock: 300, minStock: 50, currentStock: 300, isStorageItem: true, category: 'grocery' }
];

export const MEALS_28_DATA = [
  {
    mealNumber: 1,
    name: 'Veg Biryani, Kurma, Onion Raitha',
    name_ta: 'வெஜ் பிரியாணி, குருமா, தயிர் வெங்காயம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Fragrant Basmati veg biryani served with rich veg kurma and chilled onion raitha.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 750, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 400, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 300, unit: 'g' },
      { name: 'Beans', name_ta: 'பீன்ஸ்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 300, unit: 'g' },
      { name: 'Green peas', name_ta: 'பச்சை பட்டாணி', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Mint', name_ta: 'புதினா', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Basmati rice', name_ta: 'பாசுமதி அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Ginger-garlic paste', name_ta: 'இஞ்சி பூண்டு விழுது', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Biryani masala', name_ta: 'பிரியாணி மசாலா', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 15, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 2,
    name: 'Lemon Rice, Brinjal Thokku, Chickpeas',
    name_ta: 'லெமன் சாதம், கத்திரிக்காய் தொக்கு, கொண்டைக்கடலை',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Zesty lemon rice accompanied by spicy brinjal thokku and protein-rich sundal.',
    basePersons: 10,
    ingredients: [
      { name: 'Brinjal', name_ta: 'கத்திரிக்காய்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', category: 'grocery', baseQuantity: 350, unit: 'g' },
      { name: 'Lemon', name_ta: 'எலுமிச்சை', category: 'fresh', baseQuantity: 6, unit: 'pieces' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Urad dal', name_ta: 'உளுத்தம் பருப்பு', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 3,
    name: 'Sambar, Potato Fry, Appalam',
    name_ta: 'சாம்பார், உருளைக்கிழங்கு வறுவல், அப்பளம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Classic Tamil Nadu lunch with flavorful mixed vegetable sambar, crispy potato roast, and appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Mixed sambar vegetables', name_ta: 'கலவை காய்கறிகள்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 300, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Sambar powder', name_ta: 'சாம்பார் தூள்', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 4,
    name: 'Chicken Kulambu, Chicken Fry, Onion Raitha',
    name_ta: 'சிக்கன் குழம்பு, சிக்கன் வறுவல், தயிர் வெங்காயம்',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Spicy country-style chicken curry paired with crispy chicken varuval and cooling curd onion raitha.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 1, unit: 'kg' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Ginger', name_ta: 'இஞ்சி', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Garlic', name_ta: 'பூண்டு', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chicken', name_ta: 'சிக்கன் / கோழி இறைச்சி', category: 'fresh', baseQuantity: 1.6, unit: 'kg' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Pepper', name_ta: 'மிளகு', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 5,
    name: 'Brinji Rice, Veg Kurma, Sundal',
    name_ta: 'பிரிஞ்சி சாதம், வெஜ் குருமா, சுண்டல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Traditional spiced brinji rice served with creamy coconut vegetable kurma and boiled sundal.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 300, unit: 'g' },
      { name: 'Beans', name_ta: 'பீன்ஸ்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 300, unit: 'g' },
      { name: 'Green peas', name_ta: 'பச்சை பட்டாணி', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', category: 'grocery', baseQuantity: 350, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Ginger-garlic paste', name_ta: 'இஞ்சி பூண்டு விழுது', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Cinnamon', name_ta: 'பட்டை', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Cloves', name_ta: 'கிராம்பு', category: 'grocery', baseQuantity: 15, unit: 'pieces' },
      { name: 'Cardamom', name_ta: 'ஏலக்காய்', category: 'grocery', baseQuantity: 10, unit: 'pieces' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 6,
    name: 'Vatha Kuzhambu, Cabbage Carrot Poriyal, Drumstick Leaves',
    name_ta: 'வத்தக்குழம்பு, முட்டைக்கோஸ் கேரட் பொரியல், முருங்கைக்கீரை',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Tangy and aromatic vatha kuzhambu with fresh cabbage carrot stir-fry and healthy drumstick leaves.',
    basePersons: 10,
    ingredients: [
      { name: 'Cabbage', name_ta: 'முட்டைக்கோஸ்', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Drumstick leaves', name_ta: 'முருங்கைக்கீரை', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 80, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Vatha kuzhambu powder', name_ta: 'வத்தக்குழம்பு தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 7,
    name: 'Sambar, Egg Masala, Appalam',
    name_ta: 'சாம்பார், முட்டை மசாலா, அப்பளம்',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Home-style toor dal sambar paired with spicy egg masala roast and crunchy appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 500, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 400, unit: 'g' },
      { name: 'Mixed sambar vegetables', name_ta: 'கலவை காய்கறிகள்', category: 'fresh', baseQuantity: 800, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Egg', name_ta: 'முட்டை', category: 'fresh', baseQuantity: 12, unit: 'pieces' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Sambar powder', name_ta: 'சாம்பார் தூள்', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 8,
    name: 'Kurma Kuzhambu, Beetroot Poriyal, Appalam',
    name_ta: 'குருமா குழம்பு, பீட்ரூட் பொரியல், அப்பளம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Mild coconut kurma gravy served with sweet beetroot poriyal and crispy appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Beetroot', name_ta: 'பீட்ரூட்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Mixed vegetables', name_ta: 'கலவை காய்கறிகள்', category: 'fresh', baseQuantity: 800, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Ginger-garlic paste', name_ta: 'இஞ்சி பூண்டு விழுது', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 9,
    name: 'Tomato Rice, Egg Poriyal, Onion Raitha',
    name_ta: 'தக்காளி சாதம், முட்டை பொரியல், தயிர் வெங்காயம்',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Tangy spiced tomato rice served with scrambled egg poriyal and cooling onion raitha.',
    basePersons: 10,
    ingredients: [
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Egg', name_ta: 'முட்டை', category: 'fresh', baseQuantity: 12, unit: 'pieces' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 10,
    name: 'Urundai Kuzhambu, Appalam',
    name_ta: 'உருண்டை குழம்பு, அப்பளம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Chettinad style lentil dumplings simmered in rich tamarind gravy with appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 11,
    name: 'Mor Kuzhambu, Potato Fry',
    name_ta: 'மோர் குழம்பு, உருளைக்கிழங்கு வறுவல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Refreshing spiced yogurt curry served with golden potato roast.',
    basePersons: 10,
    ingredients: [
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1.5, unit: 'litre' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 150, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Cumin', name_ta: 'சீரகம்', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 12,
    name: 'Chicken Biryani, Brinjal Thokku, Egg Fry, Onion Raitha',
    name_ta: 'சிக்கன் பிரியாணி, கத்திரிக்காய் தொக்கு, முட்டை வறுவல், தயிர் வெங்காயம்',
    foodType: 'non-veg',
    category: 'Special',
    description: 'Grand festive chicken dum biryani served with brinjal thokku, boiled egg fry, and raitha.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 1, unit: 'kg' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Brinjal', name_ta: 'கத்திரிக்காய்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Mint', name_ta: 'புதினா', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Ginger', name_ta: 'இஞ்சி', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Garlic', name_ta: 'பூண்டு', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Basmati rice', name_ta: 'பாசுமதி அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chicken', name_ta: 'சிக்கன் / கோழி இறைச்சி', category: 'fresh', baseQuantity: 1.6, unit: 'kg' },
      { name: 'Egg', name_ta: 'முட்டை', category: 'fresh', baseQuantity: 12, unit: 'pieces' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Biryani masala', name_ta: 'பிரியாணி மசாலா', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 45, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 13,
    name: 'Sambar, Raw Banana Fry, Pumpkin Poriyal',
    name_ta: 'சாம்பார், வாழைக்காய் வறுவல், பரங்கிக்காய் பொரியல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Traditional feast with aromatic sambar, spicy raw banana roast, and mildly sweet pumpkin poriyal.',
    basePersons: 10,
    ingredients: [
      { name: 'Raw banana', name_ta: 'வாழைக்காய்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Pumpkin', name_ta: 'பரங்கிக்காய்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Mixed sambar vegetables', name_ta: 'கலவை காய்கறிகள்', category: 'fresh', baseQuantity: 600, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Sambar powder', name_ta: 'சாம்பார் தூள்', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 14,
    name: 'Rasam, Potato Chana Fry',
    name_ta: 'ரசம், உருளைக்கிழங்கு கடலை வறுவல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Hot peppery rasam accompanied by a hearty potato and chickpea dry fry.',
    basePersons: 10,
    ingredients: [
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', category: 'grocery', baseQuantity: 350, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Rasam powder', name_ta: 'ரசம் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Pepper', name_ta: 'மிளகு', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Cumin', name_ta: 'சீரகம்', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 15,
    name: 'Vatha Kuzhambu, Cabbage Carrot Poriyal, Appalam',
    name_ta: 'வத்தக்குழம்பு, முட்டைக்கோஸ் கேரட் பொரியல், அப்பளம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Rich tamarind-based vatha kuzhambu with grated coconut cabbage carrot poriyal and crispy appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Cabbage', name_ta: 'முட்டைக்கோஸ்', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 80, unit: 'g' },
      { name: 'Vatha kuzhambu powder', name_ta: 'வத்தக்குழம்பு தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 16,
    name: 'Coconut Rice, Potato Fry, Dal Thuvaiyal',
    name_ta: 'தேங்காய் சாதம், உருளைக்கிழங்கு வறுவல், பருப்பு துவையல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Fragrant freshly grated coconut rice with spiced potato roast and thick toor dal thuvaiyal.',
    basePersons: 10,
    ingredients: [
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Urad dal', name_ta: 'உளுத்தம் பருப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Dry red chilli', name_ta: 'வரமிளகாய்', category: 'grocery', baseQuantity: 20, unit: 'pieces' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 17,
    name: 'Tamarind Rice, Chana Masala, Mint Coriander Thuvaiyal',
    name_ta: 'புளிசாதம், கொண்டைக்கடலை மசாலா, புதினா மல்லி துவையல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Temple-style puliyodharai served with flavorful chana masala and fresh herbal thuvaiyal.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Mint', name_ta: 'புதினா', category: 'fresh', baseQuantity: 100, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 100, unit: 'g' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', category: 'grocery', baseQuantity: 350, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 80, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 18,
    name: 'Chicken Kulambu, Chicken Fry',
    name_ta: 'சிக்கன் குழம்பு, சிக்கன் வறுவல்',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Savory Chettinad chicken curry with deep-fried spiced chicken pieces.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Ginger', name_ta: 'இஞ்சி', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Garlic', name_ta: 'பூண்டு', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chicken', name_ta: 'சிக்கன் / கோழி இறைச்சி', category: 'fresh', baseQuantity: 2, unit: 'kg' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Pepper', name_ta: 'மிளகு', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 19,
    name: 'Sambar, Brinjal Fry, Keerai Kootu, Moong Dal Payasam, Curd',
    name_ta: 'சாம்பார், கத்திரிக்காய் வறுவல், கீரை கூட்டு, பயறு பாயசம், தயிர்',
    foodType: 'veg',
    category: 'Special',
    description: 'Grand multi-course feast with sambar, brinjal roast, spinach kootu, jaggery moong dal payasam, and fresh curd.',
    basePersons: 10,
    ingredients: [
      { name: 'Brinjal', name_ta: 'கத்திரிக்காய்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Mixed sambar vegetables', name_ta: 'கலவை காய்கறிகள்', category: 'fresh', baseQuantity: 650, unit: 'g' },
      { name: 'Spinach/keerai', name_ta: 'கீரை', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Green gram/moong dal', name_ta: 'பாசிப் பருப்பு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Jaggery', name_ta: 'வெல்லம்', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Sambar powder', name_ta: 'சாம்பார் தூள்', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 20,
    name: 'Kuska, Kurma, Onion Raitha',
    name_ta: 'குஷ்கா, குருமா, தயிர் வெங்காயம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Aromatic plain biryani rice (kuska) served with rich vegetable kurma and onion raitha.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Beans', name_ta: 'பீன்ஸ்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Mint', name_ta: 'புதினா', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Basmati rice', name_ta: 'பாசுமதி அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Ginger-garlic paste', name_ta: 'இஞ்சி பூண்டு விழுது', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Biryani masala', name_ta: 'பிரியாணி மசாலா', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 25, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 21,
    name: 'Egg Kuzhambu, Chow Chow Kootu',
    name_ta: 'முட்டை குழம்பு, சவ்சவ் கூட்டு',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Spicy boiled egg curry paired with nutritious dal chow chow kootu.',
    basePersons: 10,
    ingredients: [
      { name: 'Chow chow', name_ta: 'சவ்சவ்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Egg', name_ta: 'முட்டை', category: 'fresh', baseQuantity: 12, unit: 'pieces' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 22,
    name: 'Puli Kuzhambu, Snake Gourd Kootu, Appalam, Curd',
    name_ta: 'புளி குழம்பு, புடலங்காய் கூட்டு, அப்பளம், தயிர்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Tangy tamarind puli kuzhambu with comforting snake gourd kootu, appalam, and creamy curd.',
    basePersons: 10,
    ingredients: [
      { name: 'Snake gourd', name_ta: 'புடலங்காய்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 250, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 80, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 23,
    name: 'Chicken Kulambu, Chicken Fry, Rasam',
    name_ta: 'சிக்கன் குழம்பு, சிக்கன் வறுவல், ரசம்',
    foodType: 'non-veg',
    category: 'Main Course',
    description: 'Hearty chicken meal complete with spicy gravy, chicken fry, and piping hot rasam.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 850, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 1, unit: 'kg' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Ginger', name_ta: 'இஞ்சி', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Garlic', name_ta: 'பூண்டு', category: 'fresh', baseQuantity: 60, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chicken', name_ta: 'சிக்கன் / கோழி இறைச்சி', category: 'fresh', baseQuantity: 2, unit: 'kg' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Rasam powder', name_ta: 'ரசம் தூள்', category: 'grocery', baseQuantity: 40, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Pepper', name_ta: 'மிளகு', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 300, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 24,
    name: 'Lemon Rice, Potato Fry',
    name_ta: 'லெமன் சாதம், உருளைக்கிழங்கு வறுவல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Simple and comforting lemon peanut rice served with crispy potato fry.',
    basePersons: 10,
    ingredients: [
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Lemon', name_ta: 'எலுமிச்சை', category: 'fresh', baseQuantity: 6, unit: 'pieces' },
      { name: 'Peanuts', name_ta: 'வேர்க்கடலை', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Urad dal', name_ta: 'உளுத்தம் பருப்பு', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Chana dal', name_ta: 'கடலைப் பருப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 25,
    name: 'Urundai Kuzhambu, Appalam',
    name_ta: 'உருண்டை குழம்பு, அப்பளம்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Gram dal steamed balls in traditional spicy tamarind curry with fried appalam.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Toor dal', name_ta: 'துவரம் பருப்பு', category: 'grocery', baseQuantity: 300, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Tamarind', name_ta: 'புளி', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Appalam', name_ta: 'அப்பளம்', category: 'grocery', baseQuantity: 12, unit: 'pieces' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 26,
    name: 'Chana Kurma, Mor, Poriyal',
    name_ta: 'கடலை குருமா, மோர், பொரியல்',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Wholesome white chickpea kurma served with seasoned buttermilk and mixed vegetable poriyal.',
    basePersons: 10,
    ingredients: [
      { name: 'Mixed vegetables for poriyal', name_ta: 'பொரியல் காய்கறிகள்', category: 'fresh', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Chickpeas', name_ta: 'கொண்டைக்கடலை', category: 'grocery', baseQuantity: 350, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1.5, unit: 'litre' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 250, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  },
  {
    mealNumber: 27,
    name: 'Lemon Rice, Sesame Rice, Curd Rice, Thuvaiyal',
    name_ta: 'லெமன் சாதம், எள்ளு சாதம், தயிர் சாதம், துவையல்',
    foodType: 'veg',
    category: 'Special',
    description: 'Variety rice trio: zesty lemon rice, nutty ellu sadham, and creamy curd rice served with roasted coconut thuvaiyal.',
    basePersons: 10,
    ingredients: [
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Curry leaves', name_ta: 'கருவேப்பிலை', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Ginger', name_ta: 'இஞ்சி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.5, unit: 'kg' },
      { name: 'Lemon', name_ta: 'எலுமிச்சை', category: 'fresh', baseQuantity: 6, unit: 'pieces' },
      { name: 'Sesame seeds', name_ta: 'எள்ளு', category: 'grocery', baseQuantity: 200, unit: 'g' },
      { name: 'Curd', name_ta: 'தயிர்', category: 'fresh', baseQuantity: 1.5, unit: 'litre' },
      { name: 'Milk', name_ta: 'பால்', category: 'fresh', baseQuantity: 500, unit: 'ml' },
      { name: 'Urad dal', name_ta: 'உளுத்தம் பருப்பு', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Chana dal', name_ta: 'கடலைப் பருப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' },
      { name: 'Mustard', name_ta: 'கடுகு', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 60, unit: 'g' }
    ]
  },
  {
    mealNumber: 28,
    name: 'Coconut Milk Rice, Kurma',
    name_ta: 'தேங்காய் பால் சாதம், குருமா',
    foodType: 'veg',
    category: 'Main Course',
    description: 'Mildly spiced coconut milk pulav accompanied by flavorful mixed vegetable kurma.',
    basePersons: 10,
    ingredients: [
      { name: 'Onion', name_ta: 'வெங்காயம்', category: 'fresh', baseQuantity: 550, unit: 'g' },
      { name: 'Tomato', name_ta: 'தக்காளி', category: 'fresh', baseQuantity: 450, unit: 'g' },
      { name: 'Carrot', name_ta: 'கேரட்', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Beans', name_ta: 'பீன்ஸ்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Potato', name_ta: 'உருளைக்கிழங்கு', category: 'fresh', baseQuantity: 350, unit: 'g' },
      { name: 'Green chilli', name_ta: 'பச்சை மிளகாய்', category: 'fresh', baseQuantity: 10, unit: 'pieces' },
      { name: 'Mint', name_ta: 'புதினா', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Coriander', name_ta: 'கொத்தமல்லி', category: 'fresh', baseQuantity: 50, unit: 'g' },
      { name: 'Rice', name_ta: 'அரிசி', category: 'grocery', baseQuantity: 1.1, unit: 'kg' },
      { name: 'Coconut milk', name_ta: 'தேங்காய்ப்பால்', category: 'fresh', baseQuantity: 1, unit: 'litre' },
      { name: 'Coconut', name_ta: 'தேங்காய்', category: 'fresh', baseQuantity: 200, unit: 'g' },
      { name: 'Ginger-garlic paste', name_ta: 'இஞ்சி பூண்டு விழுது', category: 'grocery', baseQuantity: 60, unit: 'g' },
      { name: 'Chilli powder', name_ta: 'மிளகாய் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Coriander powder', name_ta: 'மல்லித் தூள்', category: 'grocery', baseQuantity: 30, unit: 'g' },
      { name: 'Turmeric', name_ta: 'மஞ்சள் தூள்', category: 'grocery', baseQuantity: 10, unit: 'g' },
      { name: 'Garam masala', name_ta: 'கரம் மசாலா', category: 'grocery', baseQuantity: 20, unit: 'g' },
      { name: 'Oil', name_ta: 'எண்ணெய்', category: 'grocery', baseQuantity: 250, unit: 'ml' },
      { name: 'Salt', name_ta: 'உப்பு', category: 'grocery', baseQuantity: 50, unit: 'g' }
    ]
  }
];

/**
 * Consolidates any duplicate ingredient records in MongoDB safely:
 * - Groups by canonical normalizedName
 * - Preserves correct non-zero stock (never accidentally replaces valid stock with 0)
 * - Preserves Tamil name, unit, suggested quantity, min alert
 * - Repoints StockTransaction audit logs to the retained canonical _id
 * - Deletes orphaned duplicate documents
 */
export const consolidateDuplicateIngredients = async () => {
  try {
    const allIngredients = await Ingredient.find({});
    const groups = new Map();

    for (const item of allIngredients) {
      const norm = item.normalizedName || normalizeIngredientName(item.name);
      if (!groups.has(norm)) {
        groups.set(norm, []);
      }
      groups.get(norm).push(item);
    }

    for (const [normKey, items] of groups.entries()) {
      if (items.length > 1) {
        const storageMatch = SUGGESTED_STORAGE_STOCK.find(s => normalizeIngredientName(s.name) === normKey);

        items.sort((a, b) => {
          if (storageMatch) {
            if (a.name === storageMatch.name) return -1;
            if (b.name === storageMatch.name) return 1;
          }
          if (a.isStorageItem !== b.isStorageItem) return a.isStorageItem ? -1 : 1;
          if ((a.currentStock > 0) !== (b.currentStock > 0)) return a.currentStock > 0 ? -1 : 1;
          return b.currentStock - a.currentStock;
        });

        const canonical = items[0];
        const duplicates = items.slice(1);

        // Find the best non-zero stock
        let bestStock = canonical.currentStock;
        for (const dup of duplicates) {
          if (bestStock === 0 && dup.currentStock > 0) {
            bestStock = dup.currentStock;
          }
        }
        canonical.currentStock = bestStock;

        if (storageMatch) {
          canonical.name = storageMatch.name;
          if (!canonical.name_ta || canonical.name_ta === '') canonical.name_ta = storageMatch.name_ta;
          if (!canonical.defaultUnit) canonical.defaultUnit = storageMatch.defaultUnit;
          if (!canonical.suggestedStorageStock) canonical.suggestedStorageStock = storageMatch.suggestedStorageStock;
          if (!canonical.minStock) canonical.minStock = storageMatch.minStock;
          canonical.isStorageItem = true;
          canonical.category = 'grocery';
        }
        canonical.normalizedName = normKey;
        await canonical.save();

        // Repoint references & remove duplicates
        for (const dup of duplicates) {
          await StockTransaction.updateMany(
            { ingredientId: dup._id },
            { $set: { ingredientId: canonical._id, ingredientName: canonical.name } }
          );
          await Ingredient.findByIdAndDelete(dup._id);
        }
        console.log(`[Consolidation] ✅ Merged ${duplicates.length} duplicate(s) into canonical '${canonical.name}' (${normKey}) with stock ${canonical.currentStock} ${canonical.defaultUnit}.`);
      } else {
        // Single item: ensure normalizedName is set correctly
        const item = items[0];
        if (!item.normalizedName || item.normalizedName !== normKey) {
          item.normalizedName = normKey;
          await item.save();
        }
      }
    }
  } catch (err) {
    console.error('[Consolidation] Error consolidating duplicate ingredients:', err.message);
  }
};

/**
 * Seed master ingredients and 28 recipes into MongoDB
 */
export const seedIngredientMasterData = async () => {
  try {
    console.log('[Seed] Checking and initializing Ingredient & Recipe master data...');

    // 1. First run safe consolidation on any existing duplicate records
    await consolidateDuplicateIngredients();

    // 2. Seed Suggested Storage Stock Ingredients (31 canonical items)
    for (const item of SUGGESTED_STORAGE_STOCK) {
      const norm = normalizeIngredientName(item.name);
      await Ingredient.findOneAndUpdate(
        { normalizedName: norm },
        {
          $setOnInsert: {
            name: item.name,
            normalizedName: norm,
            name_ta: item.name_ta,
            defaultUnit: item.defaultUnit,
            suggestedStorageStock: item.suggestedStorageStock,
            minStock: item.minStock,
            currentStock: item.currentStock,
            isStorageItem: true,
            category: 'grocery'
          }
        },
        { upsert: true, new: true }
      );
    }

    // 3. Register fresh ingredients from MEALS_28_DATA without creating grocery duplicates
    const existingIngs = await Ingredient.find({});
    const existingNorms = new Set(existingIngs.map(i => i.normalizedName || normalizeIngredientName(i.name)));

    const newFreshToInsert = [];
    for (const meal of MEALS_28_DATA) {
      for (const ing of meal.ingredients) {
        const norm = normalizeIngredientName(ing.name);
        if (!existingNorms.has(norm)) {
          existingNorms.add(norm);
          newFreshToInsert.push({
            name: ing.name,
            normalizedName: norm,
            name_ta: ing.name_ta || '',
            defaultUnit: ing.unit,
            category: ing.category,
            isStorageItem: ing.category === 'grocery',
            currentStock: 0,
            minStock: 0,
            suggestedStorageStock: 0
          });
        }
      }
    }
    if (newFreshToInsert.length > 0) {
      await Ingredient.insertMany(newFreshToInsert);
    }

    // 4. Map the 28 recipes directly to the original 28 Food documents with user-uploaded binary images in MongoDB
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

    for (const meal of MEALS_28_DATA) {
      const foodId = MEAL_TO_ORIGINAL_FOOD_ID[meal.mealNumber];

      // 5. Seed / Upsert the 28 Recipes linked to original Food
      await Recipe.findOneAndUpdate(
        { mealNumber: meal.mealNumber },
        {
          mealNumber: meal.mealNumber,
          name: meal.name,
          name_ta: meal.name_ta,
          foodType: meal.foodType,
          category: meal.category,
          description: meal.description,
          basePersons: 10,
          foodId: foodId ? new mongoose.Types.ObjectId(foodId) : null,
          ingredients: meal.ingredients,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    // 6. Ensure all custom/existing Food documents in DB have a linked Recipe
    const allFoods = await Food.find({});
    for (const food of allFoods) {
      const existingRecipe = await Recipe.findOne({
        $or: [{ foodId: food._id }, { name: food.name }]
      });
      if (!existingRecipe) {
        const lastRecipe = await Recipe.findOne().sort({ mealNumber: -1 });
        const nextMealNumber = (lastRecipe && typeof lastRecipe.mealNumber === 'number') ? lastRecipe.mealNumber + 1 : 1;
        await Recipe.create({
          mealNumber: nextMealNumber,
          name: food.name,
          name_ta: food.name_ta || food.name,
          foodType: food.foodType || 'veg',
          category: food.category || 'Main Course',
          description: food.description || '',
          basePersons: 10,
          foodId: food._id,
          ingredients: [],
          isActive: true
        });
      } else if (!existingRecipe.foodId) {
        existingRecipe.foodId = food._id;
        await existingRecipe.save();
      }
    }

    // 7. Clean up orphaned custom recipes (mealNumber > 28) whose food items no longer exist
    const foodIdSet = new Set(allFoods.map(f => f._id.toString()));
    const customRecipes = await Recipe.find({ mealNumber: { $gt: 28 } });
    for (const cr of customRecipes) {
      if (!cr.foodId || !foodIdSet.has(cr.foodId.toString())) {
        await Recipe.findByIdAndDelete(cr._id);
      }
    }

    console.log('[Seed] ✅ Master Ingredients (31 Storage Items) & 28 Authentic Recipes synchronized without duplicates.');
  } catch (error) {
    console.error('[Seed] Error seeding ingredient/recipe master data:', error.message);
  }
};
