import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Copy,
  Share2,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  History,
  Layers,
  Flame,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PartyPopper
} from 'lucide-react';
import { requirementApi, ingredientApi, recipeApi, menuApi, holidayApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmContext';
import { useAuth } from '../context/AuthContext';
import { canRemoveHoliday } from '../utils/dateUtils';

const INGREDIENT_DICTIONARY_TA = {
  // Dairy & Fats
  'butter': 'வெண்ணெய்',
  'fresh butter': 'புதிய வெண்ணெய்',
  'salted butter': 'உப்பு வெண்ணெய்',
  'unsalted butter': 'உப்பற்ற வெண்ணெய்',
  'ghee': 'நெய்',
  'oil': 'எண்ணெய்',
  'cooking oil': 'சமையல் எண்ணெய்',
  'sunflower oil': 'சூரியகாந்தி எண்ணெய்',
  'sesame oil': 'நல்லெண்ணெய்',
  'gingelly oil': 'நல்லெண்ணெய்',
  'coconut oil': 'தேங்காய் எண்ணெய்',
  'mustard oil': 'கடுகு எண்ணெய்',
  'groundnut oil': 'கடலை எண்ணெய்',
  'peanut oil': 'கடலை எண்ணெய்',
  'olive oil': 'ஆலிவ் எண்ணெய்',
  'milk': 'பால்',
  'curd': 'தயிர்',
  'yogurt': 'தயிர்',
  'paneer': 'பன்னீர்',
  'cottage cheese': 'பன்னீர்',
  'cheese': 'சீஸ் / பாலாடைக்கட்டி',
  'cream': 'கிரீம் / ஏடு',
  'fresh cream': 'பிரெஷ் கிரீம்',
  'butter milk': 'மோர்',
  'buttermilk': 'மோர்',

  // Seasoning & Spices
  'salt': 'உப்பு',
  'rock salt': 'கல் உப்பு',
  'crystal salt': 'கல் உப்பு',
  'sea salt': 'கடல் உப்பு',
  'sugar': 'சர்க்கரை',
  'white sugar': 'வெள்ளை சர்க்கரை',
  'brown sugar': 'நாட்டு சர்க்கரை',
  'jaggery': 'வெல்லம்',
  'palm jaggery': 'கருப்பட்டி',
  'tamarind': 'புளி',
  'tamarind paste': 'புளி விழுது',
  'turmeric': 'மஞ்சள்',
  'turmeric powder': 'மஞ்சள் தூள்',
  'chilli powder': 'மிளகாய் தூள்',
  'red chilli powder': 'சிவப்பு மிளகாய் தூள்',
  'kashmiri chilli powder': 'காஷ்மீரி மிளகாய் தூள்',
  'coriander powder': 'மல்லித் தூள்',
  'coriander seeds': 'மல்லி விதை / தனியா',
  'cumin': 'சீரகம்',
  'cumin seeds': 'சீரகம்',
  'cumin powder': 'சீரகத் தூள்',
  'jeera': 'சீரகம்',
  'mustard': 'கடுகு',
  'mustard seeds': 'கடுகு',
  'fennel': 'சோம்பு',
  'fennel seeds': 'சோம்பு',
  'saunf': 'சோம்பு',
  'fenugreek': 'வெந்தயம்',
  'fenugreek seeds': 'வெந்தயம்',
  'pepper': 'மிளகு',
  'black pepper': 'கருப்பு மிளகு',
  'black pepper powder': 'மிளகுத் தூள்',
  'white pepper': 'வெள்ளை மிளகு',
  'garam masala': 'கரம் மசாலா',
  'biryani masala': 'பிரியாணி மசாலா',
  'sambar powder': 'சாம்பார் தூள்',
  'rasam powder': 'ரசம் தூள்',
  'curry powder': 'கறி மசாலா தூள்',
  'cloves': 'கிராம்பு',
  'cinnamon': 'பட்டை',
  'cinnamon stick': 'பட்டை',
  'cardamom': 'ஏலக்காய்',
  'green cardamom': 'பச்சை ஏலக்காய்',
  'black cardamom': 'கருப்பு ஏலக்காய்',
  'bay leaf': 'பிரிஞ்சி இலை',
  'bay leaves': 'பிரிஞ்சி இலை',
  'star anise': 'அன்னாசிப்பூ',
  'nutmeg': 'ஜாதிக்காய்',
  'mace': 'ஜாதிப்பத்திரி',
  'asafoetida': 'பெருங்காயம்',
  'hing': 'பெருங்காயம்',
  'kasuri methi': 'கசூரி மேத்தி / வெந்தயக்கீரை',
  'dry fenugreek leaves': 'காய்ந்த வெந்தயக்கீரை',

  // Vegetables & Fresh Produce
  'onion': 'வெங்காயம்',
  'onions': 'வெங்காயம்',
  'shallots': 'சின்ன வெங்காயம்',
  'small onion': 'சின்ன வெங்காயம்',
  'small onions': 'சின்ன வெங்காயம்',
  'big onion': 'பெரிய வெங்காயம்',
  'big onions': 'பெரிய வெங்காயம்',
  'red onion': 'வெங்காயம்',
  'spring onion': 'வெங்காயத்தாள்',
  'spring onions': 'வெங்காயத்தாள்',
  'tomato': 'தக்காளி',
  'tomatoes': 'தக்காளி',
  'potato': 'உருளைக்கிழங்கு',
  'potatoes': 'உருளைக்கிழங்கு',
  'garlic': 'பூண்டு',
  'garlic cloves': 'பூண்டு பற்கள்',
  'ginger': 'இஞ்சி',
  'fresh ginger': 'இஞ்சி',
  'ginger garlic paste': 'இஞ்சி பூண்டு விழுது',
  'ginger-garlic paste': 'இஞ்சி பூண்டு விழுது',
  'green chilli': 'பச்சை மிளகாய்',
  'green chillies': 'பச்சை மிளகாய்',
  'red chilli': 'சிவப்பு மிளகாய்',
  'red chillies': 'சிவப்பு மிளகாய்',
  'dry red chilli': 'வரமிளகாய்',
  'dry red chillies': 'வரமிளகாய்',
  'coriander': 'கொத்தமல்லி',
  'coriander leaves': 'கொத்தமல்லி தழை',
  'cilantro': 'கொத்தமல்லி',
  'mint': 'புதினா',
  'mint leaves': 'புதினா இலைகள்',
  'curry leaves': 'கறிவேப்பிலை',
  'curry leaf': 'கறிவேப்பிலை',
  'coconut': 'தேங்காய்',
  'grated coconut': 'துருவிய தேங்காய்',
  'coconut milk': 'தேங்காய்ப்பால்',
  'carrot': 'கேரட்',
  'carrots': 'கேரட்',
  'beans': 'பீன்ஸ்',
  'french beans': 'பீன்ஸ்',
  'green peas': 'பச்சை பட்டாணி',
  'peas': 'பட்டாணி',
  'cabbage': 'முட்டைக்கோஸ்',
  'cauliflower': 'காலிஃபிளவர்',
  'brinjal': 'கத்திரிக்காய்',
  'eggplant': 'கத்திரிக்காய்',
  'aubergine': 'கத்திரிக்காய்',
  'ladies finger': 'வெண்டைக்காய்',
  'lady finger': 'வெண்டைக்காய்',
  'okra': 'வெண்டைக்காய்',
  'drumstick': 'முருங்கைக்காய்',
  'drumsticks': 'முருங்கைக்காய்',
  'capsicum': 'குடைமிளகாய்',
  'bell pepper': 'குடைமிளகாய்',
  'green capsicum': 'பச்சை குடைமிளகாய்',
  'beetroot': 'பீட்ரூட்',
  'radish': 'முள்ளங்கி',
  'bottle gourd': 'சுரைக்காய்',
  'bitter gourd': 'பாகற்காய்',
  'snake gourd': 'புடலங்காய்',
  'ridge gourd': 'பீர்க்கங்காய்',
  'ash gourd': 'வெண்பூசணி',
  'pumpkin': 'பூசணிக்காய்',
  'yellow pumpkin': 'மஞ்சள் பூசணிக்காய்',
  'white pumpkin': 'வெள்ளை பூசணிக்காய்',
  'cucumber': 'வெள்ளரிக்காய்',
  'spinach': 'கீரை',
  'palak': 'பசலைக் கீரை',
  'methi': 'வெந்தயக் கீரை',
  'fenugreek leaves': 'வெந்தயக் கீரை',
  'mushroom': 'காளான்',
  'mushrooms': 'காளான்',
  'button mushroom': 'காளான்',
  'lemon': 'எலுமிச்சை',
  'lime': 'எலுமிச்சை',
  'lemon juice': 'எலுமிச்சை சாறு',
  'raw banana': 'வாழைக்காய்',
  'plantain': 'வாழைக்காய்',
  'banana flower': 'வாழைப்பூ',
  'banana stem': 'வாழைத்தண்டு',
  'yam': 'சேனைக்கிழங்கு',
  'elephant yam': 'சேனைக்கிழங்கு',
  'colocasia': 'சேப்பங்கிழங்கு',
  'taro root': 'சேப்பங்கிழங்கு',
  'sweet potato': 'சர்க்கரைவள்ளிக் கிழங்கு',
  'chow chow': 'சௌ சௌ',
  'chayote': 'சௌ சௌ',
  'broad beans': 'அவரைக்காய்',
  'cluster beans': 'கொத்தவரங்காய்',
  'ivy gourd': 'கோவக்காய்',

  // Grains, Rice, Flours & Staples
  'rice': 'அரிசி',
  'raw rice': 'பச்சரிசி',
  'boiled rice': 'புழுங்கல் அரிசி',
  'ponni rice': 'பொன்னி அரிசி',
  'basmati rice': 'பாசுமதி அரிசி',
  'seeraga samba rice': 'சீரக சம்பா அரிசி',
  'brown rice': 'கைக்குத்தல் அரிசி',
  'idli rice': 'இட்லி அரிசி',
  'poha': 'அவல்',
  'flattened rice': 'அவல்',
  'beaten rice': 'அவல்',
  'wheat': 'கோதுமை',
  'wheat flour': 'கோதுமை மாவு',
  'atta': 'கோதுமை மாவு',
  'maida': 'மைதா மாவு',
  'all purpose flour': 'மைதா மாவு',
  'rice flour': 'அரிசி மாவு',
  'gram flour': 'கடலை மாவு',
  'besan': 'கடலை மாவு',
  'corn flour': 'மக்காச்சோள மாவு',
  'cornstarch': 'மக்காச்சோள மாவு',
  'semolina': 'ரவை',
  'rava': 'ரவை',
  'sooji': 'ரவை',
  'vermicelli': 'சேமியா',
  'semiya': 'சேமியா',
  'noodles': 'நூடுல்ஸ்',
  'pasta': 'பாஸ்தா',
  'macaroni': 'மேக்ரோனி',
  'bread': 'ரொட்டி / பிரெட்',
  'appalam': 'அப்பளம்',
  'papad': 'அப்பளம்',
  'sesame seeds': 'எள்ளு',
  'sesame': 'எள்ளு',
  'white sesame': 'வெள்ளை எள்ளு',
  'black sesame': 'கருப்பு எள்ளு',

  // Pulses & Lentils
  'toor dal': 'துவரம் பருப்பு',
  'tuvar dal': 'துவரம் பருப்பு',
  'chana dal': 'கடலைப் பருப்பு',
  'bengal gram': 'கடலைப் பருப்பு',
  'urad dal': 'உளுத்தம் பருப்பு',
  'black gram': 'உளுந்து',
  'whole urad dal': 'முழு உளுந்து',
  'moong dal': 'பாசிப் பருப்பு',
  'yellow moong dal': 'பாசிப் பருப்பு',
  'green gram': 'பச்சை பயிறு',
  'whole moong': 'பச்சை பயிறு',
  'chickpeas': 'கொண்டைக்கடலை',
  'white chickpeas': 'வெள்ளை கொண்டைக்கடலை',
  'kabuli chana': 'வெள்ளை கொண்டைக்கடலை',
  'black chickpeas': 'கருப்பு கொண்டைக்கடலை',
  'kala chana': 'கருப்பு கொண்டைக்கடலை',
  'peanuts': 'வேர்க்கடலை',
  'groundnut': 'நிலக்கடலை',
  'fried gram': 'பொட்டுக் கடலை',
  'roasted gram': 'பொட்டுக் கடலை',
  'pottukadalai': 'பொட்டுக் கடலை',
  'horse gram': 'கொள்ளு',
  'rajma': 'ராஜ்மா / சிவப்பு காராமணி',
  'kidney beans': 'ராஜ்மா',
  'cowpeas': 'காராமணி',
  'black eyed peas': 'காராமணி',
  'soya chunks': 'சோயா சங்ஸ் / மீல்மேக்கர்',
  'meal maker': 'மீல்மேக்கர்',

  // Nuts & Dry Fruits
  'cashew': 'முந்திரி',
  'cashews': 'முந்திரி பருப்பு',
  'cashew nuts': 'முந்திரி பருப்பு',
  'almond': 'பாதாம்',
  'almonds': 'பாதாம் பருப்பு',
  'badam': 'பாதாம்',
  'pistachio': 'பிஸ்தா',
  'pista': 'பிஸ்தா',
  'walnut': 'அக்ரூட் பருப்பு',
  'walnuts': 'அக்ரூட் பருப்பு',
  'raisins': 'உலர் திராட்சை',
  'dry grapes': 'உலர் திராட்சை',
  'dates': 'பேரீச்சம்பழம்',
  'dry ginger': 'சுக்கு',
  'saffron': 'குங்குமப்பூ',

  // Meat, Poultry & Seafood
  'chicken': 'சிக்கன் / கோழி இறைச்சி',
  'chicken breast': 'கோழி மார்பு இறைச்சி',
  'boneless chicken': 'எலும்பில்லா சிக்கன்',
  'mutton': 'மட்டன் / ஆட்டிறைச்சி',
  'lamb': 'ஆட்டிறைச்சி',
  'goat meat': 'ஆட்டிறைச்சி',
  'fish': 'மீன்',
  'fish fillet': 'மீன் துண்டுகள்',
  'prawn': 'இறால்',
  'prawns': 'இறால்',
  'shrimp': 'இறால்',
  'crab': 'நண்டு',
  'egg': 'முட்டை',
  'eggs': 'முட்டைகள்',
  'boiled egg': 'வேகவைத்த முட்டை',

  // Liquids & Others
  'water': 'தண்ணீர்',
  'hot water': 'சுடுதண்ணீர்',
  'cold water': 'குளிர்ந்த நீர்',
  'vinegar': 'வினிகர்',
  'soy sauce': 'சோயா சாஸ்',
  'tomato sauce': 'தக்காளி சாஸ்',
  'tomato ketchup': 'தக்காளி சாஸ்',
  'chilli sauce': 'மிளகாய் சாஸ்',
  'baking soda': 'சமையல் சோடா',
  'baking powder': 'பேக்கிங் பவுடர்',
  'yeast': 'ஈஸ்ட்',
  'vanilla essence': 'வெண்ணிலா எசென்ஸ்',
  'rose water': 'பன்னீர்'
};

const translateTextToTamil = async (text) => {
  if (!text || !text.trim()) return '';
  const clean = text.trim().toLowerCase();

  // 1. Direct dictionary match
  if (INGREDIENT_DICTIONARY_TA[clean]) {
    return INGREDIENT_DICTIONARY_TA[clean];
  }

  // 2. Partial dictionary match
  for (const [key, val] of Object.entries(INGREDIENT_DICTIONARY_TA)) {
    if (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key)) {
      return val;
    }
  }

  // 3. Online fallback (MyMemory API)
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|ta`
    );
    const data = await res.json();
    if (data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated.toLowerCase() !== text.trim().toLowerCase()) {
        return translated;
      }
    }
  } catch (err) {
    console.error('Translation error:', err);
  }
  return '';
};

const getTodayDateStr = () => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch (e) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

const getTomorrowDateStr = () => {
  try {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  } catch (e) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

const Ingredients = () => {
  const location = useLocation();
  const { language, t } = useLanguage();
  const { addNotification } = useNotifications();
  const confirm = useConfirm();
  const { currentUser, mongoUser } = useAuth();
  const isAdmin = mongoUser?.role === 'admin' || (currentUser && !mongoUser?.role);

  // Active Tab: 'daily' | 'storage' | 'recipes'
  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || 'daily');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // ─── TAB 1: DAILY REQUIREMENTS STATE ───
  const [selectedDate, setSelectedDate] = useState(() => {
    return location.state?.date || getTodayDateStr();
  });
  const [actualEmployees, setActualEmployees] = useState(10);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [allRecipesList, setAllRecipesList] = useState([]);
  const [selectedMealNumber, setSelectedMealNumber] = useState('');
  const [savingDaily, setSavingDaily] = useState(false);
  const [deductingStock, setDeductingStock] = useState(false);

  // ─── TAB 2: GROCERY STORAGE STATE ───
  const [storageInventory, setStorageInventory] = useState({ summary: {}, items: [] });
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageSearch, setStorageSearch] = useState('');
  const [storageFilter, setStorageFilter] = useState('all'); // 'all' | 'low_stock' | 'out_of_stock'
  const [editStockModal, setEditStockModal] = useState(null); // item object or null
  const [stockAction, setStockAction] = useState('add'); // 'add' | 'set'
  const [stockAmountInput, setStockAmountInput] = useState('');
  const [stockNotesInput, setStockNotesInput] = useState('');
  const [minStockInput, setMinStockInput] = useState('');
  const [suggestedStockInput, setSuggestedStockInput] = useState('');
  const [addIngredientModal, setAddIngredientModal] = useState(false);
  const [newIngForm, setNewIngForm] = useState({
    name: '',
    name_ta: '',
    category: 'grocery',
    defaultUnit: 'kg',
    currentStock: '',
    minStock: '',
    suggestedStorageStock: ''
  });
  const [transactionsModal, setTransactionsModal] = useState(false);
  const [transactionsList, setTransactionsList] = useState([]);

  // ─── TAB 4: RECIPES CATALOG STATE ───
  const [recipesList, setRecipesList] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipeFilter, setRecipeFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [recipeSearch, setRecipeSearch] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [recipeCalcEmployees, setRecipeCalcEmployees] = useState(10);

  // ─── EDIT RECIPE MODAL STATE ───
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeFormErrors, setRecipeFormErrors] = useState('');

  // Auto-translate debounce refs
  const ingredientDebounceTimers = useRef({});
  const recipeNameDebounceTimer = useRef(null);
  const newIngDebounceTimer = useRef(null);

  // ─── COMPUTED PURCHASE LIST ───
  // Independent calculation of grocery shortages vs fresh items
  const effectivePurchaseList = useMemo(() => {
    if (!dailyData || dailyData.isHoliday) return [];

    // 1. Grocery Shortages: strictly where Required Quantity > Current Storage Quantity
    const groceryPurchases = (dailyData.groceryItems || [])
      .filter(item => {
        const req = Number(item.requiredInStorageUnit !== undefined ? item.requiredInStorageUnit : item.requiredQty) || 0;
        const stock = Number(item.currentStorage) || 0;
        return req > stock;
      })
      .map(item => {
        const req = Number(item.requiredInStorageUnit !== undefined ? item.requiredInStorageUnit : item.requiredQty) || 0;
        const stock = Number(item.currentStorage) || 0;
        const shortage = Math.max(0, Math.round((req - stock) * 100) / 100);
        return {
          ...item,
          purchaseNeeded: shortage,
          category: 'grocery'
        };
      });

    // 2. Fresh Items: independent of storage; all required fresh items for today's menu must be purchased
    const freshPurchases = (dailyData.freshItems || [])
      .filter(item => (Number(item.requiredQty) || 0) > 0)
      .map(item => ({
        ...item,
        currentStorage: 0,
        purchaseNeeded: Number(item.requiredQty) || 0,
        category: item.category || 'fresh'
      }));

    // 3. Combined purchase list
    return [...groceryPurchases, ...freshPurchases];
  }, [dailyData]);

  // Load recipes list on mount for dropdowns & recipe tab
  useEffect(() => {
    fetchRecipesList();
  }, [language, activeTab]);

  // Load daily requirement whenever selectedDate or selectedMealNumber changes
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyRequirements();
    }
  }, [selectedDate, selectedMealNumber, activeTab, language]);

  // Load storage inventory when storage tab is active
  useEffect(() => {
    if (activeTab === 'storage') {
      fetchStorageInventory();
    }
  }, [activeTab, language]);


  // ─── API HANDLERS ───

  const fetchRecipesList = async () => {
    setRecipesLoading(true);
    try {
      const res = await recipeApi.getRecipes();
      const list = Array.isArray(res.data) ? res.data : [];
      setRecipesList(list);
      setAllRecipesList(list);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleDateSelect = (dateStr) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    setSelectedMealNumber(''); // Clear meal number override so auto-detection works for the selected date's menu
    setDailyData(null); // Clear previous date's stale data
  };

  const fetchDailyRequirements = async (overrideEmployees = null, targetDate = null, targetMealNumber = null) => {
    setDailyLoading(true);
    try {
      const dateToFetch = targetDate || selectedDate;
      const mealToFetch = targetMealNumber !== null ? targetMealNumber : selectedMealNumber;
      const empCount = overrideEmployees !== null ? overrideEmployees : '';
      const res = await requirementApi.getDailyRequirement(dateToFetch, empCount, mealToFetch);
      const data = res.data;
      setDailyData(data);
      if (overrideEmployees === null && data?.actualEmployees !== undefined) {
        setActualEmployees(data.isHoliday ? 0 : (data.actualEmployees > 0 ? data.actualEmployees : 10));
      }
    } catch (err) {
      console.error('Error fetching daily requirements:', err);
      addNotification(err.response?.data?.message || 'Failed to load daily requirements', 'warning');
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchStorageInventory = async () => {
    setStorageLoading(true);
    try {
      const res = await ingredientApi.getStorageInventory();
      setStorageInventory(res.data || { summary: {}, items: [] });
    } catch (err) {
      console.error('Error fetching storage inventory:', err);
      addNotification('Failed to fetch grocery storage inventory', 'warning');
    } finally {
      setStorageLoading(false);
    }
  };



  const fetchTransactions = async () => {
    try {
      const res = await ingredientApi.getTransactions({ limit: 40 });
      setTransactionsList(Array.isArray(res.data) ? res.data : []);
      setTransactionsModal(true);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // ─── ACTIONS ───

  // Live recalculation on employee count change
  const handleEmployeeCountChange = (newCount) => {
    const val = Math.max(0, parseInt(newCount, 10) || 0);
    setActualEmployees(val);
    fetchDailyRequirements(val);
  };

  // Save confirmed employee count
  const handleSaveDaily = async () => {
    setSavingDaily(true);
    try {
      await requirementApi.saveDailyRequirement({
        date: selectedDate,
        actualEmployees,
        mealNumber: dailyData?.dish?.mealNumber || selectedMealNumber || 1
      });
      addNotification('Daily employee count saved successfully! 🎉', 'success');
      await fetchDailyRequirements(actualEmployees);
    } catch (err) {
      console.error('Error saving daily requirement:', err);
      addNotification('Failed to save daily employee requirement', 'warning');
    } finally {
      setSavingDaily(false);
    }
  };

  // Confirm stock deduction
  const handleConfirmDeductStock = async () => {
    const isConfirmed = await confirm({
      title: t('ingredients.confirmDeductBtn'),
      message: t('ingredients.confirmDeductConfirm'),
      confirmText: t('ingredients.confirmDeductBtn'),
      cancelText: t('common.cancel'),
      type: 'warning'
    });

    if (!isConfirmed) return;

    setDeductingStock(true);
    try {
      const res = await requirementApi.confirmStockDeduction({
        date: selectedDate,
        actualEmployees,
        mealNumber: dailyData?.dish?.mealNumber || selectedMealNumber || 1
      });
      addNotification(res.data?.message || t('ingredients.stockDeductedSuccess'), 'success');
      await fetchDailyRequirements(actualEmployees);
      if (activeTab === 'storage') fetchStorageInventory();
    } catch (err) {
      console.error('Error confirming stock deduction:', err);
      addNotification(err.response?.data?.message || 'Failed to deduct stock from storage', 'warning');
    } finally {
      setDeductingStock(false);
    }
  };

  // Mark current date as Holiday
  const handleMarkHoliday = async () => {
    const isConfirmed = await confirm({
      title: t('holiday.markHolidayPromptTitle') || 'Mark as Holiday?',
      message: t('holiday.markHolidayPromptMsg') || 'This date will be treated as a non-working lunch day. No lunch, ingredient, fresh-item, or purchase requirements will be generated.',
      confirmText: t('holiday.markHolidayBtn') || 'Mark Holiday',
      cancelText: t('common.cancel') || 'Cancel',
      type: 'warning'
    });

    if (!isConfirmed) return;

    try {
      await holidayApi.markHoliday({ date: selectedDate });
      addNotification(t('holiday.markedSuccess') || 'Date marked as Holiday successfully! 🎉', 'success');
      fetchDailyRequirements();
    } catch (err) {
      console.error('Error marking holiday:', err);
      addNotification(err.response?.data?.message || 'Failed to mark holiday', 'warning');
    }
  };

  // Remove Holiday status
  const handleRemoveHoliday = async () => {
    if (!canRemoveHoliday(selectedDate)) {
      addNotification('Cannot remove holiday for a past or completed lunch date (1:00 PM cutoff).', 'warning');
      return;
    }

    const isConfirmed = await confirm({
      title: t('holiday.removeHolidayPromptTitle') || 'Remove Holiday?',
      message: t('holiday.removeHolidayPromptMsg') || 'This date will return to a normal working day.',
      confirmText: t('holiday.removeHolidayBtn') || 'Remove Holiday',
      cancelText: t('common.cancel') || 'Cancel',
      type: 'warning'
    });

    if (!isConfirmed) return;

    try {
      await holidayApi.removeHoliday(selectedDate);
      addNotification(t('holiday.removedSuccess') || 'Holiday removed successfully. Normal working day restored!', 'success');
      fetchDailyRequirements();
    } catch (err) {
      console.error('Error removing holiday:', err);
      addNotification(err.response?.data?.message || 'Failed to remove holiday', 'warning');
    }
  };

  // Update stock modal submit
  const handleSaveStockUpdate = async (e) => {
    e.preventDefault();
    if (!editStockModal) return;
    try {
      const payload = {
        action: stockAction,
        amount: stockAction === 'add' ? Number(stockAmountInput) : undefined,
        newStock: stockAction === 'set' ? Number(stockAmountInput) : undefined,
        minStock: minStockInput !== '' ? Number(minStockInput) : undefined,
        suggestedStorageStock: suggestedStockInput !== '' ? Number(suggestedStockInput) : undefined,
        notes: stockNotesInput.trim()
      };
      await ingredientApi.updateStock(editStockModal._id, payload);
      addNotification(t('ingredients.updateStockSuccess'), 'success');
      setEditStockModal(null);
      setStockAmountInput('');
      setStockNotesInput('');
      fetchStorageInventory();
    } catch (err) {
      console.error('Error updating stock:', err);
      addNotification(err.response?.data?.message || 'Failed to update stock', 'warning');
    }
  };

  // Add new custom ingredient submit
  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    try {
      await ingredientApi.addIngredient(newIngForm);
      addNotification('Ingredient created successfully! 🎉', 'success');
      setAddIngredientModal(false);
      setNewIngForm({
        name: '',
        name_ta: '',
        category: 'grocery',
        defaultUnit: 'kg',
        currentStock: '',
        minStock: '',
        suggestedStorageStock: ''
      });
      fetchStorageInventory();
    } catch (err) {
      console.error('Error adding ingredient:', err);
      addNotification(err.response?.data?.message || 'Failed to add ingredient', 'warning');
    }
  };

  // ─── EDIT RECIPE ACTIONS ───
  const handleOpenEditRecipe = (recipe) => {
    if (!recipe) return;
    setRecipeFormErrors('');
    setEditingRecipe({
      _id: recipe._id,
      mealNumber: recipe.mealNumber,
      name: recipe.name || '',
      name_ta: recipe.name_ta || '',
      foodType: recipe.foodType || 'veg',
      category: recipe.category || 'Main Course',
      description: recipe.description || '',
      basePersons: recipe.basePersons || 10,
      ingredients: (recipe.ingredients || []).map(ing => ({
        name: ing.name || '',
        name_ta: ing.name_ta || '',
        category: ing.category || 'grocery',
        baseQuantity: ing.baseQuantity !== undefined && ing.baseQuantity !== null ? ing.baseQuantity : '',
        unit: ing.unit || 'g',
        ingredientId: ing.ingredientId || null
      }))
    });
  };

  const handleCloseEditRecipe = () => {
    setEditingRecipe(null);
    setRecipeFormErrors('');
  };

  const handleRecipeFieldChange = (field, val) => {
    setEditingRecipe(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: val };
      if (field === 'name') {
        const cleanVal = (val || '').trim().toLowerCase();
        if (cleanVal && INGREDIENT_DICTIONARY_TA[cleanVal]) {
          updated.name_ta = INGREDIENT_DICTIONARY_TA[cleanVal];
        }
      }
      return updated;
    });

    if (field === 'name' && val && val.trim()) {
      const cleanVal = val.trim().toLowerCase();
      if (!INGREDIENT_DICTIONARY_TA[cleanVal]) {
        if (recipeNameDebounceTimer.current) {
          clearTimeout(recipeNameDebounceTimer.current);
        }
        recipeNameDebounceTimer.current = setTimeout(async () => {
          const translated = await translateTextToTamil(val);
          if (translated) {
            setEditingRecipe(prev => {
              if (!prev) return prev;
              if ((prev.name || '').trim().toLowerCase() === cleanVal) {
                return { ...prev, name_ta: translated };
              }
              return prev;
            });
          }
        }, 500);
      }
    }
  };

  const handleIngredientFieldChange = (index, field, val) => {
    setEditingRecipe(prev => {
      if (!prev) return prev;
      const newIngs = [...prev.ingredients];
      const current = newIngs[index] || {};
      newIngs[index] = { ...current, [field]: val };

      if (field === 'name') {
        const cleanVal = (val || '').trim().toLowerCase();
        if (cleanVal && INGREDIENT_DICTIONARY_TA[cleanVal]) {
          newIngs[index].name_ta = INGREDIENT_DICTIONARY_TA[cleanVal];
        }
      }

      return { ...prev, ingredients: newIngs };
    });

    if (field === 'name' && val && val.trim()) {
      const cleanVal = val.trim().toLowerCase();
      if (!INGREDIENT_DICTIONARY_TA[cleanVal]) {
        if (ingredientDebounceTimers.current[index]) {
          clearTimeout(ingredientDebounceTimers.current[index]);
        }
        ingredientDebounceTimers.current[index] = setTimeout(async () => {
          const translated = await translateTextToTamil(val);
          if (translated) {
            setEditingRecipe(prev => {
              if (!prev || !prev.ingredients[index]) return prev;
              const curName = (prev.ingredients[index].name || '').trim().toLowerCase();
              if (curName === cleanVal) {
                const updatedIngs = [...prev.ingredients];
                updatedIngs[index] = { ...updatedIngs[index], name_ta: translated };
                return { ...prev, ingredients: updatedIngs };
              }
              return prev;
            });
          }
        }, 500);
      }
    }
  };

  const handleNewIngNameChange = (val) => {
    const cleanVal = (val || '').trim().toLowerCase();
    const directTamil = cleanVal && INGREDIENT_DICTIONARY_TA[cleanVal] ? INGREDIENT_DICTIONARY_TA[cleanVal] : '';
    setNewIngForm(prev => ({
      ...prev,
      name: val,
      name_ta: directTamil || prev.name_ta
    }));

    if (val && val.trim() && !directTamil) {
      if (newIngDebounceTimer.current) {
        clearTimeout(newIngDebounceTimer.current);
      }
      newIngDebounceTimer.current = setTimeout(async () => {
        const translated = await translateTextToTamil(val);
        if (translated) {
          setNewIngForm(prev => {
            if ((prev.name || '').trim().toLowerCase() === cleanVal && !prev.name_ta) {
              return { ...prev, name_ta: translated };
            }
            return prev;
          });
        }
      }, 500);
    }
  };


  const handleDeleteStorageItem = async (item) => {
    const targetId = item?._id || item?.id;
    if (!targetId) return;
    const isConfirmed = await confirm({
      title: t('ingredients.deleteStorageTitle') || 'Remove from Storage',
      message: `${t('ingredients.confirmDeleteStorage') || 'Are you sure you want to remove this item from physical storage?'} (${item.name}) ${t('ingredients.deleteStorageNote') || 'Recipe and food requirements will remain completely intact.'}`,
      confirmText: t('common.delete') || 'Delete',
      cancelText: t('common.cancel') || 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    try {
      await ingredientApi.deleteIngredient(targetId);
      addNotification(t('ingredients.storageDeletedSuccess') || 'Storage item removed successfully', 'success');
      await fetchStorageInventory();
      fetchDailyRequirements();
    } catch (err) {
      console.error('Error deleting storage item:', err);
      addNotification(err.response?.data?.message || 'Failed to remove storage item', 'warning');
    }
  };

  const handleAddIngredientRow = () => {
    setEditingRecipe(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: '', name_ta: '', category: 'grocery', baseQuantity: '', unit: 'g' }
      ]
    }));
  };

  const handleRemoveIngredientRow = async (index) => {
    const ing = editingRecipe.ingredients[index];
    const isConfirmed = await confirm({
      title: t('ingredients.removeIngredient') || 'Remove Ingredient',
      message: `${t('ingredients.confirmRemoveIngredient') || 'Are you sure you want to remove this ingredient from the recipe?'} (${ing.name || 'Unnamed'})`,
      confirmText: t('common.delete') || 'Delete',
      cancelText: t('common.cancel') || 'Cancel',
      type: 'danger'
    });
    if (!isConfirmed) return;

    setEditingRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSaveRecipe = async (e) => {
    if (e) e.preventDefault();
    if (!editingRecipe) return;

    if (!editingRecipe.name.trim()) {
      setRecipeFormErrors(t('ingredients.dishNameEn') || 'Dish name is required');
      return;
    }

    if (!editingRecipe.ingredients || editingRecipe.ingredients.length === 0) {
      setRecipeFormErrors('Recipe must contain at least one ingredient');
      return;
    }

    for (let i = 0; i < editingRecipe.ingredients.length; i++) {
      const ing = editingRecipe.ingredients[i];
      if (!ing.name || !ing.name.trim()) {
        setRecipeFormErrors(`Ingredient #${i + 1} must have a valid name`);
        return;
      }
      const qty = Number(ing.baseQuantity);
      if (isNaN(qty) || qty < 0 || ing.baseQuantity === '') {
        setRecipeFormErrors(`Ingredient "${ing.name}" must have a valid base quantity`);
        return;
      }
      if (!ing.unit || !ing.unit.trim()) {
        setRecipeFormErrors(`Ingredient "${ing.name}" must have a unit`);
        return;
      }
    }

    setRecipeFormErrors('');
    setSavingRecipe(true);
    try {
      const payload = {
        name: editingRecipe.name.trim(),
        name_ta: (editingRecipe.name_ta || '').trim(),
        foodType: editingRecipe.foodType,
        category: editingRecipe.category,
        description: editingRecipe.description,
        basePersons: Number(editingRecipe.basePersons) || 10,
        ingredients: editingRecipe.ingredients.map(ing => ({
          name: ing.name.trim(),
          name_ta: (ing.name_ta || '').trim(),
          category: ing.category === 'fresh' ? 'fresh' : 'grocery',
          baseQuantity: Number(ing.baseQuantity),
          unit: ing.unit.trim(),
          ingredientId: ing.ingredientId || null
        }))
      };

      const res = await recipeApi.updateRecipe(editingRecipe._id, payload);
      const updatedRecipe = res.data?.recipe || res.data;

      // Immediately update local recipes lists state
      setRecipesList(prev => prev.map(r => r._id === editingRecipe._id ? { ...r, ...updatedRecipe } : r));
      setAllRecipesList(prev => prev.map(r => r._id === editingRecipe._id ? { ...r, ...updatedRecipe } : r));

      // Refresh daily requirements if current displayed dish was updated
      if (dailyData?.dish?.mealNumber === editingRecipe.mealNumber || dailyData?.dish?._id === editingRecipe._id) {
        fetchDailyRequirements();
      }

      // Refresh storage inventory to reflect synced grocery items
      fetchStorageInventory();

      addNotification(t('ingredients.recipeUpdatedSuccess') || 'Recipe updated successfully! 🎉', 'success');
      setEditingRecipe(null);
    } catch (err) {
      console.error('Error saving recipe:', err);
      const errMsg = err.response?.data?.message || t('ingredients.recipeUpdateFailed') || 'Failed to update recipe';
      setRecipeFormErrors(errMsg);
      addNotification(errMsg, 'warning');
    } finally {
      setSavingRecipe(false);
    }
  };

  // Helper to build standardized shopping / fresh list text

  const buildFormattedListText = (items, title) => {
    if (!items || items.length === 0) return '';
    const isPurchase = (title || '').toLowerCase().includes('purchase');
    const menuName = dailyData?.dish?.name || 'Lunch Menu';

    let text = `📋 *${title}*\n`;
    text += `📅 Date: ${selectedDate}\n`;
    text += `👥 Employees: ${actualEmployees}\n`;
    text += `🍛 *Today's Menu:* ${menuName}\n\n`;
    text += `────────────────\n\n`;

    items.forEach((item) => {
      let qty = 0;
      let unit = '';
      if (isPurchase) {
        qty = (item.purchaseNeeded !== undefined && item.purchaseNeeded !== null && !isNaN(item.purchaseNeeded))
          ? item.purchaseNeeded
          : (item.purchaseRequired ?? item.requiredQty ?? 0);
        unit = item.storageUnit || item.unit || item.defaultUnit || '';
      } else {
        qty = (item.requiredQty !== undefined && item.requiredQty !== null && !isNaN(item.requiredQty))
          ? item.requiredQty
          : (item.purchaseNeeded ?? item.baseQty ?? 0);
        unit = item.unit || item.storageUnit || item.defaultUnit || '';
      }

      const nameTaStr = item.name_ta ? ` (${item.name_ta})` : '';
      text += `• *${item.name}*${nameTaStr}: **${qty} ${unit}**\n`;
    });

    text += `\n────────────────\n*Smart Lunch Generator*`;
    return text;
  };

  // Copy shopping list to clipboard
  const handleCopyShoppingList = (items, title) => {
    if (!items || items.length === 0) return;
    const text = buildFormattedListText(items, title);
    navigator.clipboard.writeText(text);
    addNotification(t('ingredients.listCopied'), 'success');
  };

  // Share to WhatsApp
  const handleShareWhatsapp = (items, title) => {
    if (!items || items.length === 0) return;
    const text = buildFormattedListText(items, title);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered storage inventory
  const filteredStorageItems = useMemo(() => {
    const list = storageInventory.items || [];
    return list.filter(item => {
      const matchesSearch = !storageSearch.trim() ||
        item.name.toLowerCase().includes(storageSearch.toLowerCase()) ||
        (item.name_ta && item.name_ta.includes(storageSearch));
      const matchesStatus =
        storageFilter === 'all' ||
        (storageFilter === 'low_stock' && item.status === 'low_stock') ||
        (storageFilter === 'out_of_stock' && item.status === 'out_of_stock');
      return matchesSearch && matchesStatus;
    });
  }, [storageInventory, storageSearch, storageFilter]);

  // Separate into Storage Stock (currentStock > 0) and Out of Stock (currentStock <= 0)
  const inStockStorageItems = useMemo(() => {
    return filteredStorageItems.filter(item => Number(item.currentStock) > 0);
  }, [filteredStorageItems]);

  const outOfStockStorageItems = useMemo(() => {
    return filteredStorageItems.filter(item => Number(item.currentStock) <= 0);
  }, [filteredStorageItems]);

  // Filtered recipes catalog
  const filteredRecipes = useMemo(() => {
    return recipesList.filter(r => {
      const matchesType = recipeFilter === 'all' || r.foodType === recipeFilter;
      const matchesSearch = !recipeSearch.trim() ||
        r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        (r.name_ta && r.name_ta.includes(recipeSearch)) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(recipeSearch.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [recipesList, recipeFilter, recipeSearch]);

  return (
    <div className="min-h-screen pb-16 w-full max-w-7xl mx-auto space-y-6">

      {/* ── Top Header Banner ── */}
      <div className="glass-panel rounded-[24px] p-5 sm:p-7 border border-[rgba(212,175,55,0.3)] bg-gradient-to-r from-bgCard via-bgCard to-[#041d14] relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gold-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gold-500/20 to-emerald-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-glowGold">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-title tracking-tight flex items-center gap-2">
                {t('ingredients.title')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-body-muted max-w-2xl">
              {t('ingredients.subtitle')}
            </p>
          </div>

          {/* Tab Navigation Pill Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 glass-panel rounded-2xl bg-black/40 border border-white/10 self-start lg:self-center">
            {[
              { id: 'daily', label: t('ingredients.tabDaily'), icon: Clock },
              { id: 'storage', label: t('ingredients.tabStorage'), icon: Package },
              { id: 'recipes', label: recipesList.length > 0 ? `${recipesList.length} ${t('ingredients.tabRecipes')}` : t('ingredients.tabRecipes'), icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${active
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-black shadow-glowGold font-extrabold scale-102'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-black' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: DAILY REQUIREMENTS & PURCHASE PLAN
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'daily' && (
        <div className="space-y-6">

          {/* Date & Meal Selection Controls */}
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/10 bg-bgCard space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Date selection shortcuts & Holiday toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider mr-1">
                  {t('ingredients.selectDate')}:
                </span>
                <button
                  onClick={() => handleDateSelect(getTodayDateStr())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDate === getTodayDateStr()
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {t('dashboard.todayTitle').split(' ')[0] || 'Today'}
                </button>
                <button
                  onClick={() => handleDateSelect(getTomorrowDateStr())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDate === getTomorrowDateStr()
                    ? 'bg-accentOrange/20 text-accentOrange border border-accentOrange/50 shadow-sm'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {t('dashboard.tomorrowTitle').split(' ')[0] || 'Tomorrow'}
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="glass-panel px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                />

                {/* Holiday Toggle Button on the Date bar */}
                {dailyData?.isHoliday ? (
                  <div className="flex items-center gap-2 ml-1">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gold-500/20 border border-gold-500/50 text-gold-400 text-xs font-extrabold shadow-glowGold">
                      <span>{t('holiday.badge')}</span>
                    </span>
                    {canRemoveHoliday(selectedDate) && (
                      <button
                        onClick={handleRemoveHoliday}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/20 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t('holiday.removeHolidayBtn')}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleMarkHoliday}
                    className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gold-500/15 hover:bg-gold-500/25 text-gold-400 border border-gold-500/40 hover:border-gold-500/70 transition-all cursor-pointer flex items-center justify-center shadow-sm"
                  >
                    <span>{t('holiday.markHolidayBtn')}</span>
                  </button>
                )}
              </div>

              {/* Meal / Recipe override dropdown (only when not holiday) */}
              {!dailyData?.isHoliday && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Meal Recipe:
                  </span>
                  <select
                    value={selectedMealNumber}
                    onChange={(e) => setSelectedMealNumber(e.target.value)}
                    className="glass-panel px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-gold-500/50 max-w-[260px] truncate [&>option]:bg-bgCard cursor-pointer"
                  >
                    <option value="">Auto from Scheduled Menu</option>
                    {allRecipesList.map(r => (
                      <option key={r.mealNumber} value={r.mealNumber}>
                        #{r.mealNumber} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* If Holiday: Show Beautiful Holiday State Card */}
            {dailyData?.isHoliday ? (
              <div className="pt-3 border-t border-white/10">
                <div className="glass-panel rounded-[20px] p-4 sm:p-6 border border-gold-500/40 bg-gradient-to-br from-gold-500/15 via-white/5 to-transparent text-center flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Holiday Icon */}
                  <div className="holiday-icon-ring w-12 h-12 rounded-2xl bg-[var(--accent-orange)]/12 border border-[var(--accent-orange)]/25 flex items-center justify-center shadow-sm mb-3">
                    <PartyPopper className="h-6 w-6 text-[var(--accent-orange)]" />
                  </div>

                  <span className="px-3 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/50 text-gold-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 shadow-sm">
                    {t('holiday.badge')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-0.5">
                    {dailyData.holiday?.name || t('holiday.title')}
                  </h3>
                  {dailyData.holiday?.name_ta && (
                    <p className="text-xs sm:text-sm text-gold-400 font-bold mb-1.5 font-sans">
                      {dailyData.holiday.name_ta}
                    </p>
                  )}
                  <p className="text-xs text-gray-300 max-w-lg mb-4 leading-relaxed">
                    {t('holiday.holidayNotice')} {t('holiday.holidayDesc')}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Lunch Menu</span>
                      <span className="text-xs font-bold text-gold-400">None (Holiday)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Employees Lunch</span>
                      <span className="text-xs font-bold text-gray-300">Not Applicable</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Storage Grocery</span>
                      <span className="text-xs font-bold text-emerald-400">{t('holiday.noRequirements')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Fresh Perishables</span>
                      <span className="text-xs font-bold text-purple-400">{t('holiday.noRequirements')}</span>
                    </div>
                  </div>

                  {canRemoveHoliday(selectedDate) && (
                    <button
                      onClick={handleRemoveHoliday}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                      <span>{t('holiday.removeHolidayBtn')}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Dish Hero Card + Employee Input */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 border-t border-white/10">

                  {/* Left Column: Menu Details & Base Recipe Tags */}
                  <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${dailyData?.dish?.foodType === 'non-veg'
                            ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                            : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                            }`}>
                            {dailyData?.dish?.foodType === 'non-veg' ? '🍗 NON-VEG' : '🌿 VEG'} • {dailyData?.dish?.category || 'Main Course'}
                          </span>
                          {dailyData?.dish?.mealNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-bold">
                              Meal #{dailyData.dish.mealNumber}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {dailyData?.dish?.name || 'Loading Lunch Menu...'}
                        </h3>
                        {dailyData?.dish?.name_ta && (
                          <p className="text-xs sm:text-sm text-gold-400 font-semibold mt-0.5 font-sans">
                            {dailyData.dish.name_ta}
                          </p>
                        )}
                      </div>

                      {isAdmin && dailyData?.dish && (
                        <button
                          onClick={() => {
                            const matched = allRecipesList.find(r => r.mealNumber === dailyData.dish.mealNumber || r._id === dailyData.dish._id) || dailyData.dish;
                            handleOpenEditRecipe(matched);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-400 hover:text-gold-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                          title={t('ingredients.editRecipe') || 'Edit Recipe'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{t('ingredients.editRecipe') || 'Edit Recipe'}</span>
                        </button>
                      )}
                    </div>


                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                        <Users className="h-3.5 w-3.5 text-gold-400" />
                        <span>{t('ingredients.baseRecipeNotice')}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{t('ingredients.formulaNotice')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actual Employee Count Input */}
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-gold-500/15 via-white/5 to-transparent border border-gold-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {t('ingredients.employeesApplied')}
                        </label>
                        <span className="text-[10px] font-semibold text-gray-300">Scaling Factor: {(actualEmployees / 10).toFixed(2)}x</span>
                      </div>
                      <p className="text-[11px] text-gray-300 mb-3">{t('ingredients.employeesAppliedDesc')}</p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEmployeeCountChange(Math.max(0, actualEmployees - 1))}
                          className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={actualEmployees}
                          onChange={(e) => handleEmployeeCountChange(e.target.value)}
                          className="flex-1 h-12 glass-panel text-center text-2xl font-black text-white bg-black/40 border border-gold-500/40 rounded-xl focus:outline-none focus:border-gold-500 shadow-inner"
                        />
                        <button
                          onClick={() => handleEmployeeCountChange(actualEmployees + 1)}
                          className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={handleSaveDaily}
                        disabled={savingDaily}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{savingDaily ? 'Saving...' : t('ingredients.saveCount')}</span>
                      </button>

                      {(() => {
                        const isDeductionConfirmed = Boolean(
                          dailyData?.isStockDeducted &&
                          Number(dailyData?.deductedEmployees) === Number(actualEmployees) &&
                          (dailyData?.deductedMealNumber == null || dailyData?.deductedMealNumber === (dailyData?.dish?.mealNumber || selectedMealNumber || 1))
                        );

                        return (
                          <button
                            onClick={handleConfirmDeductStock}
                            disabled={deductingStock || isDeductionConfirmed}
                            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isDeductionConfirmed
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-not-allowed opacity-80'
                              : 'bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-glowGold'
                              }`}
                            style={isDeductionConfirmed ? {} : { backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>
                              {isDeductionConfirmed
                                ? t('ingredients.stockDeducted')
                                : deductingStock ? 'Deducting...' : t('ingredients.confirmDeductBtn')}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                </div>

                {/* Quick Metrics Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('ingredients.employeesApplied')}</span>
                    <span className="text-lg font-extrabold text-white">{actualEmployees} Employees</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Grocery Storage Items</span>
                    <span className="text-lg font-extrabold text-gold-400">{dailyData?.groceryItems?.length || 0} Items</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Fresh Perishables</span>
                    <span className="text-lg font-extrabold text-emerald-400">{dailyData?.freshItems?.length || 0} Items</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Immediate Purchase</span>
                    <span className={`text-lg font-extrabold ${effectivePurchaseList.length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                      {effectivePurchaseList.length} Items Short
                    </span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Tables: Only show when NOT a Holiday */}
          {!dailyData?.isHoliday && (
            <>

              {/* ── Today's Purchase List (Shown when purchase is needed) ── */}
              <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-red-500/30 bg-gradient-to-br from-red-500/5 via-bgCard to-bgCard relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      {t('ingredients.purchaseListHeader')}
                    </h3>
                    <p className="text-xs text-gray-400">{t('ingredients.purchaseListSub')}</p>
                  </div>

                  {effectivePurchaseList.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyShoppingList(effectivePurchaseList, "Today's Purchase List")}
                        className="px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5 text-gold-400" />
                        <span>{t('ingredients.copyList')}</span>
                      </button>
                      <button
                        onClick={() => handleShareWhatsapp(effectivePurchaseList, "Today's Purchase List")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                        {t('ingredients.shareWhatsapp')}
                      </button>
                    </div>
                  )}
                </div>

                {effectivePurchaseList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 pl-2">#</th>
                          <th className="pb-3">{t('ingredients.itemName')}</th>
                          <th className="pb-3 text-right">{t('ingredients.required')}</th>
                          <th className="pb-3 text-right">{t('ingredients.available')}</th>
                          <th className="pb-3 text-right font-bold text-red-400">{t('ingredients.purchaseNeeded')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {effectivePurchaseList.map((item, idx) => (
                          <tr key={item.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 pl-2 font-mono text-gray-400">{idx + 1}</td>
                            <td className="py-3">
                              <span className="font-bold text-white">{item.name}</span>
                              {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                            </td>
                            <td className="py-3 text-right font-semibold text-gray-200">
                              {item.requiredInStorageUnit || item.requiredQty} {item.storageUnit || item.unit}
                            </td>
                            <td className="py-3 text-right text-gray-300 font-medium">
                              {item.currentStorage} {item.storageUnit || item.unit}
                            </td>
                            <td className="py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold">
                                + {item.purchaseNeeded} {item.storageUnit || item.unit}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-200 font-semibold">
                      {t('ingredients.allStockSufficient')}
                    </p>
                  </div>
                )}
              </div>

              {/* ── 🏪 Grocery / Storage Items Table ── */}
              <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/10 bg-bgCard space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      {t('ingredients.groceryStorageHeader')}
                    </h3>
                    <p className="text-xs text-gray-400">{t('ingredients.groceryStorageSub')}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 pl-2">#</th>
                        <th className="pb-3">{t('ingredients.itemName')}</th>
                        <th className="pb-3 text-right">Base (10p)</th>
                        <th className="pb-3 text-right">{t('ingredients.required')} Today</th>
                        <th className="pb-3 text-right">{t('ingredients.available')}</th>
                        <th className="pb-3 text-right">{t('ingredients.purchaseNeeded')}</th>
                        <th className="pb-3 text-right">{t('ingredients.remainingAfterLunch')}</th>
                        <th className="pb-3 text-center">{t('ingredients.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dailyData?.groceryItems?.map((item, idx) => {
                        const isShort = item.purchaseNeeded > 0;
                        return (
                          <tr key={item.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 pl-2 font-mono text-gray-400">{idx + 1}</td>
                            <td className="py-3">
                              <span className="font-bold text-white">{item.name}</span>
                              {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                            </td>
                            <td className="py-3 text-right text-gray-400 font-medium">
                              {item.baseQty} {item.unit}
                            </td>
                            <td className="py-3 text-right font-bold text-gold-400">
                              {item.requiredQty} {item.unit}
                            </td>
                            <td className="py-3 text-right text-gray-200 font-semibold">
                              {item.currentStorage} {item.storageUnit || item.unit}
                            </td>
                            <td className="py-3 text-right">
                              {isShort ? (
                                <span className="text-red-400 font-extrabold">
                                  {item.purchaseNeeded} {item.storageUnit || item.unit}
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-semibold">0 {item.storageUnit || item.unit}</span>
                              )}
                            </td>
                            <td className="py-3 text-right font-bold text-gray-200">
                              {item.remainingStock} {item.storageUnit || item.unit}
                            </td>
                            <td className="py-3 text-center">
                              {isShort ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                                  Shortfall
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                  In Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── 🥬 Fresh Items Required Today Table ── */}
              <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-emerald-500/20 bg-bgCard space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      {t('ingredients.freshItemsHeader')}
                    </h3>
                    <p className="text-xs text-gray-400">{t('ingredients.freshItemsSub')}</p>
                  </div>

                  {dailyData?.freshItems?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyShoppingList(dailyData.freshItems, "Today's Fresh Produce Required")}
                        className="px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5 text-gold-400" />
                        <span>{t('ingredients.copyList')}</span>
                      </button>
                      <button
                        onClick={() => handleShareWhatsapp(dailyData.freshItems, "Today's Fresh Produce Required")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                        {t('ingredients.shareWhatsapp')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 pl-2">#</th>
                        <th className="pb-3">{t('ingredients.itemName')}</th>
                        <th className="pb-3 text-right">Base Recipe (10p)</th>
                        <th className="pb-3 text-right font-bold text-emerald-400">{t('ingredients.required')} Today</th>
                        <th className="pb-3 text-center">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dailyData?.freshItems?.map((item, idx) => (
                        <tr key={item.name} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pl-2 font-mono text-gray-400">{idx + 1}</td>
                          <td className="py-3">
                            <span className="font-bold text-white">{item.name}</span>
                            {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                          </td>
                          <td className="py-3 text-right text-gray-400 font-medium">
                            {item.baseQty} {item.unit}
                          </td>
                          <td className="py-3 text-right font-extrabold text-emerald-300 text-sm">
                            {item.requiredQty} {item.unit}
                          </td>
                          <td className="py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                              Fresh Daily Produce
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: GROCERY STORAGE / INVENTORY
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'storage' && (
        <div className="space-y-6">

          {/* Storage Header & Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 sm:p-5 rounded-[22px] border border-white/10 bg-bgCard">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Storage Items</span>
              <span className="text-2xl font-black text-white">{storageInventory.summary?.totalItems || 0}</span>
              <span className="text-[10px] text-gray-400 block mt-1">31 Suggested Items</span>
            </div>
            <div className="glass-panel p-4 sm:p-5 rounded-[22px] border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Healthy Stock</span>
              <span className="text-2xl font-black text-emerald-300">{storageInventory.summary?.inStockCount || 0}</span>
              <span className="text-[10px] text-emerald-400/80 block mt-1">Sufficient for meals</span>
            </div>
            <div className="glass-panel p-4 sm:p-5 rounded-[22px] border border-amber-500/30 bg-amber-500/5">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Low Stock Warning</span>
              <span className="text-2xl font-black text-amber-300">{storageInventory.summary?.lowStockCount || 0}</span>
              <span className="text-[10px] text-amber-400/80 block mt-1">Below minimum threshold</span>
            </div>
            <div className="glass-panel p-4 sm:p-5 rounded-[22px] border border-red-500/30 bg-red-500/5">
              <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">Out of Stock</span>
              <span className="text-2xl font-black text-red-400">{storageInventory.summary?.outOfStockCount || 0}</span>
              <span className="text-[10px] text-red-400/80 block mt-1">Requires immediate refill</span>
            </div>
          </div>

          {/* Storage Filter & Action Bar */}
          <div className="glass-panel rounded-[24px] p-4 sm:p-5 border border-white/10 bg-bgCard flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grocery stock..."
                  value={storageSearch}
                  onChange={(e) => setStorageSearch(e.target.value)}
                  className="w-full glass-panel pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-gold-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 glass-panel rounded-xl bg-white/5 border border-white/10 text-xs">
                {['all', 'low_stock', 'out_of_stock'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStorageFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${storageFilter === f ? 'bg-gold-500 text-black shadow-sm font-extrabold' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTransactions}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <History className="h-4 w-4 text-gold-400" />
                <span>Audit Logs</span>
              </button>
              <button
                onClick={() => setAddIngredientModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-xs rounded-xl shadow-glowGold hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* ── Section 1: STORAGE STOCK (currentStock > 0) ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-glowEmerald" />
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  {t('ingredients.storageStockSection')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {inStockStorageItems.length}
                </span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline-block">
                {t('ingredients.storageStockSub')}
              </span>
            </div>

            {inStockStorageItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inStockStorageItems.map((item) => {
                  const pct = item.suggestedStorageStock > 0
                    ? Math.min(100, Math.round((item.currentStock / item.suggestedStorageStock) * 100))
                    : 100;
                  const isLow = item.currentStock <= item.minStock;

                  return (
                    <div
                      key={item._id}
                      className={`glass-panel p-5 rounded-[22px] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${isLow
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-white/10 bg-bgCard hover:border-gold-500/40 shadow-sm'
                        }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-white text-base">{item.name}</h4>
                            {item.name_ta && <p className="text-xs text-gold-400 font-semibold">{item.name_ta}</p>}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isLow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                            {isLow ? t('ingredients.lowStock') : t('ingredients.inStock')}
                          </span>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between">
                          <span className="text-2xl font-black text-white">
                            {item.currentStock} <span className="text-sm font-bold text-gray-400">{item.defaultUnit}</span>
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            Suggested: {item.suggestedStorageStock} {item.defaultUnit}
                          </span>
                        </div>

                        {/* Stock level progress bar */}
                        <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-gray-400 font-semibold truncate">Min: {item.minStock} {item.defaultUnit}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditStockModal(item);
                              setStockAction('add');
                              setStockAmountInput('');
                              setMinStockInput(String(item.minStock || ''));
                              setSuggestedStockInput(String(item.suggestedStorageStock || ''));
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                            title={t('ingredients.addStockTitle')}
                          >
                            <Edit2 className="h-3 w-3 text-gold-400" />
                            <span>{t('ingredients.addStockTitle')}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStorageItem(item)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                            title={t('ingredients.deleteStorageTitle') || 'Delete from Storage'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center text-xs text-gray-400">
                {t('ingredients.noInStockItems')}
              </div>
            )}
          </div>

          {/* ── Section 2: OUT OF STOCK (currentStock <= 0) ── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-red-500 shadow-glowRed" />
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  {t('ingredients.outOfStockSection')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500/20 text-red-300 border border-red-500/40">
                  {outOfStockStorageItems.length}
                </span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline-block">
                {t('ingredients.outOfStockSub')}
              </span>
            </div>

            {outOfStockStorageItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfStockStorageItems.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel p-5 rounded-[22px] border border-red-500/40 bg-red-500/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{item.name}</h4>
                          {item.name_ta && <p className="text-xs text-gold-400 font-semibold">{item.name_ta}</p>}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                          {t('ingredients.outOfStock')}
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-red-400">
                          0 <span className="text-sm font-bold text-gray-400">{item.defaultUnit}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          Suggested: {item.suggestedStorageStock} {item.defaultUnit}
                        </span>
                      </div>

                      {/* Stock level progress bar: Empty */}
                      <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                        <div className="h-full rounded-full bg-red-500 w-0" />
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold truncate">Min: {item.minStock} {item.defaultUnit}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditStockModal(item);
                            setStockAction('add');
                            setStockAmountInput('');
                            setMinStockInput(String(item.minStock || ''));
                            setSuggestedStockInput(String(item.suggestedStorageStock || ''));
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title={t('ingredients.addStockTitle')}
                        >
                          <Edit2 className="h-3 w-3 text-gold-400" />
                          <span>{t('ingredients.addStockTitle')}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStorageItem(item)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          title={t('ingredients.deleteStorageTitle') || 'Delete from Storage'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/5 text-center text-xs text-emerald-300 font-semibold">
                {t('ingredients.noOutOfStockItems')}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 4: 28 DISH RECIPES & BASE PROPORTIONS CATALOG
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">

          {/* Catalog Filter & Search */}
          <div className="glass-panel rounded-[24px] p-5 border border-white/10 bg-bgCard flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-gold-400" />
                {recipesList.length > 28 ? `${recipesList.length} ${language === 'ta' ? 'உணவு ரெசிபிகள்' : 'Dish Recipes'}` : t('ingredients.dishRecipeCount')}
              </h3>
              <p className="text-xs text-gray-400">Standardized recipes with 10-person base quantities</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('ingredients.searchDishes')}
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  className="w-full glass-panel pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 p-1 glass-panel rounded-xl bg-white/5 border border-white/10 text-xs">
                {[
                  { id: 'all', label: t('ingredients.filterAll') },
                  { id: 'veg', label: t('ingredients.filterVeg') },
                  { id: 'non-veg', label: t('ingredients.filterNonVeg') }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRecipeFilter(tab.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${recipeFilter === tab.id ? 'bg-gold-500 text-black font-extrabold' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recipe Cards Accordion List */}
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => {
              const isExpanded = expandedRecipeId === recipe._id;
              const scalingRatio = (recipeCalcEmployees / 10);

              return (
                <div
                  key={recipe._id}
                  className="glass-panel rounded-[22px] border border-white/10 bg-bgCard overflow-hidden transition-all duration-300"
                >
                  <div
                    onClick={() => setExpandedRecipeId(isExpanded ? null : recipe._id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-black text-gold-400 text-sm flex-shrink-0">
                        #{recipe.mealNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${recipe.foodType === 'non-veg' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {recipe.foodType}
                          </span>
                          <span className="text-[10px] text-gray-500">{recipe.category}</span>
                        </div>
                        <h4 className="font-bold text-white text-base">{recipe.name}</h4>
                        {recipe.name_ta && <p className="text-xs text-gold-400/90 font-medium">{recipe.name_ta}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 hidden sm:inline-block">
                        {(recipe.ingredients || []).length} Ingredients (Base 10p)
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditRecipe(recipe);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-400 hover:text-gold-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                          title={t('ingredients.editRecipe') || 'Edit Recipe'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('ingredients.editRecipe') || 'Edit Recipe'}</span>
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Recipe Breakdown Table */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/10 bg-black/20 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-400 max-w-xl">{recipe.description || 'No description provided.'}</p>

                        <div className="flex flex-wrap items-center gap-3">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditRecipe(recipe)}
                              className="px-3 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 text-gold-400 hover:text-gold-300 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>{t('ingredients.editRecipe') || 'Edit Recipe'}</span>
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gold-400 font-bold">Simulate Employees:</span>
                            <input
                              type="number"
                              min="1"
                              value={recipeCalcEmployees}
                              onChange={(e) => setRecipeCalcEmployees(Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-16 h-8 text-center glass-panel bg-white/5 border border-white/15 rounded-lg text-white font-bold text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                                <th className="pb-2.5 pl-2">Ingredient</th>
                                <th className="pb-2.5">Category</th>
                                <th className="pb-2.5 text-right">Base Qty (10 Persons)</th>
                                <th className="pb-2.5 text-right font-bold text-gold-300">
                                  Scaled for {recipeCalcEmployees} Persons
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {recipe.ingredients.map((ing, idx) => {
                                const scaled = Math.round((ing.baseQuantity / 10) * recipeCalcEmployees * 100) / 100;
                                return (
                                  <tr key={idx} className="hover:bg-white/3">
                                    <td className="py-2.5 pl-2">
                                      <span className="font-bold text-white">{ing.name}</span>
                                      {ing.name_ta && <span className="text-gray-400 ml-2">({ing.name_ta})</span>}
                                    </td>
                                    <td className="py-2.5">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ing.category === 'grocery'
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                        {ing.category}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right text-gray-400">
                                      {ing.baseQuantity} {ing.unit}
                                    </td>
                                    <td className="py-2.5 text-right font-black text-gold-300">
                                      {scaled} {ing.unit}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center space-y-2">
                          <p className="text-xs text-gray-400">No ingredients added yet</p>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditRecipe(recipe)}
                              className="px-3.5 py-1.5 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs hover:bg-gold-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add Ingredients</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: EDIT STOCK / ADJUST INVENTORY
      ───────────────────────────────────────────────────────────────────────────── */}
      {editStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-[24px] p-6 border border-gold-500/40 bg-bgCard w-full max-w-md space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-gold-400" />
                {t('ingredients.addStockTitle')} — {editStockModal.name}
              </h3>
              <button
                onClick={() => setEditStockModal(null)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="space-y-4">
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Current Stock:</span>
                <span className="font-extrabold text-white text-sm">
                  {editStockModal.currentStock} {editStockModal.defaultUnit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockAction('add')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${stockAction === 'add' ? 'bg-gold-500 text-black font-extrabold shadow-sm' : 'bg-white/5 text-gray-400'
                    }`}
                >
                  {t('ingredients.addAmount')} (+)
                </button>
                <button
                  type="button"
                  onClick={() => setStockAction('set')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${stockAction === 'set' ? 'bg-gold-500 text-black font-extrabold shadow-sm' : 'bg-white/5 text-gray-400'
                    }`}
                >
                  {t('ingredients.setStock')} (=)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {stockAction === 'add' ? 'Amount to Add' : 'New Stock Level'} ({editStockModal.defaultUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder={`e.g. 5 ${editStockModal.defaultUnit}`}
                  value={stockAmountInput}
                  onChange={(e) => setStockAmountInput(e.target.value)}
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Min Alert ({editStockModal.defaultUnit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minStockInput}
                    onChange={(e) => setMinStockInput(e.target.value)}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Suggested ({editStockModal.defaultUnit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={suggestedStockInput}
                    onChange={(e) => setSuggestedStockInput(e.target.value)}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly grocery procurement refill"
                  value={stockNotesInput}
                  onChange={(e) => setStockNotesInput(e.target.value)}
                  className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStockModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs shadow-glowGold transition-all cursor-pointer"
                  style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: ADD NEW CUSTOM INGREDIENT
      ───────────────────────────────────────────────────────────────────────────── */}
      {addIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-[24px] p-6 border border-gold-500/40 bg-bgCard w-full max-w-lg space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-gold-400" />
                Add New Ingredient to Inventory
              </h3>
              <button
                onClick={() => setAddIngredientModal(false)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name (English)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sona Masoori Rice"
                    value={newIngForm.name}
                    onChange={(e) => handleNewIngNameChange(e.target.value)}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name (Tamil)</label>
                  <input
                    type="text"
                    placeholder="எ.கா. சோனா மசூரி அரிசி"
                    value={newIngForm.name_ta}
                    onChange={(e) => setNewIngForm({ ...newIngForm, name_ta: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category*</label>
                  <select
                    value={newIngForm.category}
                    onChange={(e) => setNewIngForm({ ...newIngForm, category: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500 [&>option]:bg-bgCard"
                  >
                    <option value="grocery">Grocery / Storage</option>
                    <option value="fresh">Fresh Produce / Perishable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Default Unit*</label>
                  <select
                    value={newIngForm.defaultUnit}
                    onChange={(e) => setNewIngForm({ ...newIngForm, defaultUnit: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500 [&>option]:bg-bgCard"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Millilitres (ml)</option>
                    <option value="L">Litres (L)</option>
                    <option value="pieces">Pieces</option>
                    <option value="packets">Packets</option>
                    <option value="nos">Nos</option>
                    <option value="tbsp">Tablespoons (tbsp)</option>
                    <option value="tsp">Teaspoons (tsp)</option>
                    <option value="cups">Cups</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Minimum Alert Level</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={newIngForm.minStock}
                    onChange={(e) => setNewIngForm({ ...newIngForm, minStock: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Suggested Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={newIngForm.suggestedStorageStock}
                    onChange={(e) => setNewIngForm({ ...newIngForm, suggestedStorageStock: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddIngredientModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs shadow-glowGold transition-all cursor-pointer"
                  style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                >
                  Create Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: INVENTORY AUDIT / TRANSACTION LOGS
      ───────────────────────────────────────────────────────────────────────────── */}
      {transactionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-[24px] p-6 border border-white/15 bg-bgCard w-full max-w-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="h-4 w-4 text-gold-400" />
                Inventory Stock Audit Trail
              </h3>
              <button
                onClick={() => setTransactionsModal(false)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2.5 pl-2">Time</th>
                    <th className="pb-2.5">Item</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5 text-right">Change</th>
                    <th className="pb-2.5 text-right">Balance</th>
                    <th className="pb-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactionsList.map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/3">
                      <td className="py-2.5 pl-2 font-mono text-gray-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-bold text-white">{tx.ingredientName}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${tx.type === 'usage_deduction'
                          ? 'bg-red-500/15 text-red-400'
                          : tx.type === 'stock_addition'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-gold-500/15 text-gold-400'
                          }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-black ${tx.type === 'usage_deduction' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                        {tx.type === 'usage_deduction' ? '-' : '+'}{tx.quantity} {tx.unit}
                      </td>
                      <td className="py-2.5 text-right text-gray-300 font-bold">
                        {tx.newStock} {tx.unit}
                      </td>
                      <td className="py-2.5 text-gray-400 text-[11px] max-w-[150px] truncate">{tx.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: EDIT DISH RECIPE & INGREDIENTS
      ───────────────────────────────────────────────────────────────────────────── */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel rounded-[24px] p-5 sm:p-7 border border-gold-500/40 bg-bgCard w-full max-w-4xl space-y-5 shadow-2xl relative max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-400 font-black text-base shadow-glowGold flex-shrink-0">
                  #{editingRecipe.mealNumber}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-gold-400" />
                    <span>{t('ingredients.editRecipeTitle') || 'Edit Recipe & Ingredients'}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t('ingredients.editRecipeSub') || 'Update base ingredients and proportions for 10 persons.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEditRecipe}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error Notification inside modal */}
            {recipeFormErrors && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 flex-shrink-0 animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{recipeFormErrors}</span>
              </div>
            )}

            {/* Modal Scrollable Content Form */}
            <form onSubmit={handleSaveRecipe} className="flex-1 overflow-y-auto pr-1 space-y-5">

              {/* Dish Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('ingredients.dishNameEn') || 'Dish Name (English)'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRecipe.name}
                    onChange={(e) => handleRecipeFieldChange('name', e.target.value)}
                    placeholder="e.g. Chicken Biryani"
                    className="w-full glass-panel px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('ingredients.dishNameTa') || 'Dish Name (Tamil)'}
                  </label>
                  <input
                    type="text"
                    value={editingRecipe.name_ta}
                    onChange={(e) => handleRecipeFieldChange('name_ta', e.target.value)}
                    placeholder="எ.கா. சிக்கன் பிரியாணி"
                    className="w-full glass-panel px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('ingredients.foodType') || 'Food Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRecipeFieldChange('foodType', 'veg')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${editingRecipe.foodType === 'veg'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm font-extrabold'
                          : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                        }`}
                    >
                      <span>🌿 VEG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecipeFieldChange('foodType', 'non-veg')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${editingRecipe.foodType === 'non-veg'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm font-extrabold'
                          : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                        }`}
                    >
                      <span>🍗 NON-VEG</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('ingredients.category') || 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editingRecipe.category}
                    onChange={(e) => handleRecipeFieldChange('category', e.target.value)}
                    placeholder="e.g. Main Course"
                    className="w-full glass-panel px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('ingredients.description') || 'Description / Instructions'}
                  </label>
                  <textarea
                    rows="2"
                    value={editingRecipe.description}
                    onChange={(e) => handleRecipeFieldChange('description', e.target.value)}
                    placeholder="Short description of this dish recipe..."
                    className="w-full glass-panel px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-gold-500/60 resize-none"
                  />
                </div>
              </div>

              {/* Ingredients List Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Ingredients</span>
                      <span className="px-2 py-0.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-extrabold">
                        {editingRecipe.ingredients.length} items
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Standard base quantities for <strong>10 Persons</strong>. Employee scaling automatically applies to these values.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-glowGold self-start sm:self-auto active:scale-95"
                    style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t('ingredients.addIngredient') || 'Add Ingredient'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                        <th className="py-2.5 pl-3 w-10">#</th>
                        <th className="py-2.5 min-w-[140px]">{t('ingredients.ingredientNameEn') || 'Ingredient Name'} *</th>
                        <th className="py-2.5 min-w-[120px]">{t('ingredients.ingredientNameTa') || 'Tamil Name'}</th>
                        <th className="py-2.5 min-w-[130px]">{t('ingredients.ingredientCategory') || 'Category'}</th>
                        <th className="py-2.5 min-w-[110px] text-right">{t('ingredients.baseQuantity') || 'Base Qty (10p)'} *</th>
                        <th className="py-2.5 min-w-[90px]">{t('ingredients.unit') || 'Unit'} *</th>
                        <th className="py-2.5 pr-3 text-center w-12">{t('ingredients.actions') || 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {editingRecipe.ingredients.map((ing, idx) => (
                        <tr key={idx} className="hover:bg-white/3 transition-colors">
                          <td className="py-2 pl-3 font-mono text-gray-400 text-center">{idx + 1}</td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Onion"
                              value={ing.name}
                              onChange={(e) => handleIngredientFieldChange(idx, 'name', e.target.value)}
                              className="w-full glass-panel px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-gold-500/60"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              placeholder="எ.கா. வெங்காயம்"
                              value={ing.name_ta}
                              onChange={(e) => handleIngredientFieldChange(idx, 'name_ta', e.target.value)}
                              className="w-full glass-panel px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500/60"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={ing.category}
                              onChange={(e) => handleIngredientFieldChange(idx, 'category', e.target.value)}
                              className={`w-full glass-panel px-2.5 py-1.5 rounded-lg bg-black/40 border text-xs font-bold focus:outline-none cursor-pointer [&>option]:bg-bgCard ${ing.category === 'grocery'
                                  ? 'border-gold-500/40 text-gold-400'
                                  : 'border-emerald-500/40 text-emerald-400'
                                }`}
                            >
                              <option value="grocery">🏪 Grocery</option>
                              <option value="fresh">🥬 Fresh</option>
                            </select>
                          </td>
                          <td className="py-2 pr-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              placeholder="0"
                              value={ing.baseQuantity}
                              onChange={(e) => handleIngredientFieldChange(idx, 'baseQuantity', e.target.value)}
                              className="w-full glass-panel px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-right font-black text-xs focus:outline-none focus:border-gold-500/60"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <select
                              value={ing.unit}
                              onChange={(e) => handleIngredientFieldChange(idx, 'unit', e.target.value)}
                              className="w-full glass-panel px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer [&>option]:bg-bgCard font-medium"
                            >
                              <option value="g">g (grams)</option>
                              <option value="kg">kg (kilograms)</option>
                              <option value="ml">ml (millilitres)</option>
                              <option value="L">L (litres)</option>
                              <option value="pieces">pieces</option>
                              <option value="packets">packets</option>
                              <option value="nos">nos</option>
                              <option value="tbsp">tbsp</option>
                              <option value="tsp">tsp</option>
                              <option value="cups">cups</option>
                            </select>
                          </td>
                          <td className="py-2 pr-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredientRow(idx)}
                              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                              title={t('ingredients.removeIngredient') || 'Remove Ingredient'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {editingRecipe.ingredients.length === 0 && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center space-y-2">
                    <p className="text-xs text-gray-400">No ingredients in this recipe yet.</p>
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="px-3.5 py-1.5 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs hover:bg-gold-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add First Ingredient</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseEditRecipe}
                  disabled={savingRecipe}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingRecipe}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs shadow-glowGold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                  style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                >
                  {savingRecipe ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Recipe...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{t('ingredients.saveRecipeChanges') || 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ingredients;

