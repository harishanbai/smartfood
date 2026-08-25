import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { requirementApi, ingredientApi, recipeApi, menuApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmContext';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};


const Ingredients = () => {
  const { language, t } = useLanguage();
  const { addNotification } = useNotifications();
  const confirm = useConfirm();

  // Active Tab: 'daily' | 'storage' | 'monthly' | 'recipes'
  const [activeTab, setActiveTab] = useState('daily');

  // ─── TAB 1: DAILY REQUIREMENTS STATE ───
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
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

  // Load recipes list on mount for dropdowns & recipe tab
  useEffect(() => {
    fetchRecipesList();
  }, [language]);

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

  const fetchDailyRequirements = async (overrideEmployees = null) => {
    setDailyLoading(true);
    try {
      const empCount = overrideEmployees !== null ? overrideEmployees : actualEmployees;
      const res = await requirementApi.getDailyRequirement(selectedDate, empCount, selectedMealNumber);
      const data = res.data;
      setDailyData(data);
      if (overrideEmployees === null && data?.actualEmployees !== undefined) {
        setActualEmployees(data.actualEmployees);
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
      fetchDailyRequirements();
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
        actualEmployees
      });
      addNotification(t('ingredients.stockDeductedSuccess'), 'success');
      fetchDailyRequirements();
      if (activeTab === 'storage') fetchStorageInventory();
    } catch (err) {
      console.error('Error confirming stock deduction:', err);
      addNotification(err.response?.data?.message || 'Failed to deduct stock from storage', 'warning');
    } finally {
      setDeductingStock(false);
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

  // Copy shopping list to clipboard
  const handleCopyShoppingList = (items, title) => {
    if (!items || items.length === 0) return;
    let text = `📋 ${title}\n📅 Date: ${selectedDate} | 👥 Employees: ${actualEmployees}\n────────────────────────\n`;
    items.forEach((item, idx) => {
      const qty = item.purchaseNeeded !== undefined ? item.purchaseNeeded : item.purchaseRequired;
      const unit = item.storageUnit || item.defaultUnit || item.unit;
      text += `${idx + 1}. ${item.name} (${item.name_ta || ''}) — ${qty} ${unit}\n`;
    });
    text += `────────────────────────\nGenerated via Smart Lunch App`;
    navigator.clipboard.writeText(text);
    addNotification(t('ingredients.listCopied'), 'success');
  };

  // Share to WhatsApp
  const handleShareWhatsapp = (items, title) => {
    if (!items || items.length === 0) return;
    let text = `📋 *${title}*\n📅 Date: ${selectedDate} | 👥 Employees: ${actualEmployees}\n────────────────\n`;
    items.forEach((item, idx) => {
      const qty = item.purchaseNeeded !== undefined ? item.purchaseNeeded : item.purchaseRequired;
      const unit = item.storageUnit || item.defaultUnit || item.unit;
      text += `• *${item.name}* (${item.name_ta || ''}): ${qty} ${unit}\n`;
    });
    text += `────────────────\n_Smart Lunch Generator_`;
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
              { id: 'recipes', label: t('ingredients.tabRecipes'), icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    active
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
              {/* Date selection shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                  {t('ingredients.selectDate')}:
                </span>
                <button
                  onClick={() => setSelectedDate(getTodayDateStr())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDate === getTodayDateStr()
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {t('dashboard.todayTitle').split(' ')[0] || 'Today'}
                </button>
                <button
                  onClick={() => setSelectedDate(getTomorrowDateStr())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDate === getTomorrowDateStr()
                      ? 'bg-accentOrange/20 text-accentOrange border border-accentOrange/50 shadow-sm'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {t('dashboard.tomorrowTitle').split(' ')[0] || 'Tomorrow'}
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="glass-panel px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-gold-500/50"
                />
              </div>

              {/* Meal / Recipe override dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Meal Recipe:
                </span>
                <select
                  value={selectedMealNumber}
                  onChange={(e) => setSelectedMealNumber(e.target.value)}
                  className="glass-panel px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500/50 max-w-[260px] truncate [&>option]:bg-bgCard cursor-pointer"
                >
                  <option value="">Auto from Scheduled Menu</option>
                  {allRecipesList.map(r => (
                    <option key={r.mealNumber} value={r.mealNumber}>
                      #{r.mealNumber} - {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dish Hero Card + Employee Input */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 border-t border-white/5">

              {/* Left Column: Menu Details & Base Recipe Tags */}
              <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        dailyData?.dish?.foodType === 'non-veg'
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
                      <p className="text-xs sm:text-sm text-gold-400/90 font-medium mt-0.5 font-sans">
                        {dailyData.dish.name_ta}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                    <Users className="h-3.5 w-3.5 text-gold-400" />
                    <span>{t('ingredients.baseRecipeNotice')}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t('ingredients.formulaNotice')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actual Employee Count Input */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-gold-500/10 via-white/5 to-transparent border border-gold-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {t('ingredients.employeesApplied')}
                    </label>
                    <span className="text-[10px] text-gray-400">Scaling Factor: {(actualEmployees / 10).toFixed(2)}x</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">{t('ingredients.employeesAppliedDesc')}</p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEmployeeCountChange(Math.max(0, actualEmployees - 1))}
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
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
                      className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={handleSaveDaily}
                    disabled={savingDaily}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {savingDaily ? 'Saving...' : t('ingredients.saveCount')}
                  </button>

                  <button
                    onClick={handleConfirmDeductStock}
                    disabled={deductingStock || dailyData?.isStockDeducted}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      dailyData?.isStockDeducted
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-not-allowed opacity-80'
                        : 'bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-glowGold'
                    }`}
                    style={dailyData?.isStockDeducted ? {} : { backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {dailyData?.isStockDeducted
                      ? t('ingredients.stockDeducted')
                      : deductingStock ? 'Deducting...' : t('ingredients.confirmDeductBtn')}
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">{t('ingredients.employeesApplied')}</span>
                <span className="text-lg font-extrabold text-white">{actualEmployees} Employees</span>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Grocery Storage Items</span>
                <span className="text-lg font-extrabold text-gold-400">{dailyData?.groceryItems?.length || 0} Items</span>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Fresh Perishables</span>
                <span className="text-lg font-extrabold text-emerald-400">{dailyData?.freshItems?.length || 0} Items</span>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Immediate Purchase</span>
                <span className={`text-lg font-extrabold ${dailyData?.purchaseList?.length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {dailyData?.purchaseList?.length || 0} Items Short
                </span>
              </div>
            </div>

          </div>

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

              {dailyData?.purchaseList?.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyShoppingList(dailyData.purchaseList, "Today's Grocery Purchase List")}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-gold-400" />
                    {t('ingredients.copyList')}
                  </button>
                  <button
                    onClick={() => handleShareWhatsapp(dailyData.purchaseList, "Today's Grocery Purchase List")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                    {t('ingredients.shareWhatsapp')}
                  </button>
                </div>
              )}
            </div>

            {dailyData?.purchaseList?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pl-2">#</th>
                      <th className="pb-3">{t('ingredients.itemName')}</th>
                      <th className="pb-3 text-right">{t('ingredients.required')}</th>
                      <th className="pb-3 text-right">{t('ingredients.available')}</th>
                      <th className="pb-3 text-right font-bold text-red-400">{t('ingredients.purchaseNeeded')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dailyData.purchaseList.map((item, idx) => (
                      <tr key={item.name} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 pl-2 font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-3">
                          <span className="font-bold text-white">{item.name}</span>
                          {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-200">
                          {item.requiredInStorageUnit || item.requiredQty} {item.storageUnit || item.unit}
                        </td>
                        <td className="py-3 text-right text-gray-400">
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
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
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
                      <tr key={item.name} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 pl-2 font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-3">
                          <span className="font-bold text-white">{item.name}</span>
                          {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                        </td>
                        <td className="py-3 text-right text-gray-400">
                          {item.baseQty} {item.unit}
                        </td>
                        <td className="py-3 text-right font-bold text-gold-300">
                          {item.requiredQty} {item.unit}
                        </td>
                        <td className="py-3 text-right text-gray-300 font-semibold">
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
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-emerald-400" />
                    {t('ingredients.copyList')}
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
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">#</th>
                    <th className="pb-3">{t('ingredients.itemName')}</th>
                    <th className="pb-3 text-right">Base Recipe (10p)</th>
                    <th className="pb-3 text-right font-bold text-emerald-400">{t('ingredients.required')} Today</th>
                    <th className="pb-3 text-center">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dailyData?.freshItems?.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-white/3 transition-colors">
                      <td className="py-3 pl-2 font-mono text-gray-500">{idx + 1}</td>
                      <td className="py-3">
                        <span className="font-bold text-white">{item.name}</span>
                        {item.name_ta && <span className="block text-[11px] text-gray-400">{item.name_ta}</span>}
                      </td>
                      <td className="py-3 text-right text-gray-400">
                        {item.baseQty} {item.unit}
                      </td>
                      <td className="py-3 text-right font-extrabold text-emerald-300 text-sm">
                        {item.requiredQty} {item.unit}
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          Fresh Daily Produce
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
              <span className="text-[10px] text-gray-500 block mt-1">31 Suggested Items</span>
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
                  className="w-full glass-panel pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 glass-panel rounded-xl bg-white/5 border border-white/10 text-xs">
                {['all', 'low_stock', 'out_of_stock'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStorageFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      storageFilter === f ? 'bg-gold-500 text-black shadow-sm font-extrabold' : 'text-gray-400 hover:text-white'
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
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <History className="h-4 w-4 text-gold-400" />
                Audit Logs
              </button>
              <button
                onClick={() => setAddIngredientModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-xs rounded-xl shadow-glowGold hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
              >
                <Plus className="h-4 w-4" />
                Add Item
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
                      className={`glass-panel p-5 rounded-[22px] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                        isLow
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-white/10 bg-bgCard hover:border-gold-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-white text-base">{item.name}</h4>
                            {item.name_ta && <p className="text-xs text-gold-400/90 font-medium">{item.name_ta}</p>}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isLow
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
                          <span className="text-xs text-gray-400">
                            Suggested: {item.suggestedStorageStock} {item.defaultUnit}
                          </span>
                        </div>

                        {/* Stock level progress bar */}
                        <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLow ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Min Alert: {item.minStock} {item.defaultUnit}</span>
                        <button
                          onClick={() => {
                            setEditStockModal(item);
                            setStockAction('add');
                            setStockAmountInput('');
                            setMinStockInput(String(item.minStock || ''));
                            setSuggestedStockInput(String(item.suggestedStorageStock || ''));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3 text-gold-400" />
                          {t('ingredients.addStockTitle')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl glass-panel border border-white/5 text-center text-xs text-gray-400">
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
                          {item.name_ta && <p className="text-xs text-gold-400/90 font-medium">{item.name_ta}</p>}
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

                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Min Alert: {item.minStock} {item.defaultUnit}</span>
                      <button
                        onClick={() => {
                          setEditStockModal(item);
                          setStockAction('add');
                          setStockAmountInput('');
                          setMinStockInput(String(item.minStock || ''));
                          setSuggestedStockInput(String(item.suggestedStorageStock || ''));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3 text-gold-400" />
                        {t('ingredients.addStockTitle')}
                      </button>
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
                {t('ingredients.dishRecipeCount')}
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
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      recipeFilter === tab.id ? 'bg-gold-500 text-black font-extrabold' : 'text-gray-400 hover:text-white'
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
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            recipe.foodType === 'non-veg' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {recipe.foodType}
                          </span>
                          <span className="text-[10px] text-gray-500">{recipe.category}</span>
                        </div>
                        <h4 className="font-bold text-white text-base">{recipe.name}</h4>
                        {recipe.name_ta && <p className="text-xs text-gold-400/90 font-medium">{recipe.name_ta}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 hidden sm:inline-block">
                        {recipe.ingredients.length} Ingredients (Base 10p)
                      </span>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Recipe Breakdown Table */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/10 bg-black/20 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-400 max-w-xl">{recipe.description}</p>

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
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      ing.category === 'grocery'
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
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockAction === 'add' ? 'bg-gold-500 text-black font-extrabold shadow-sm' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {t('ingredients.addAmount')} (+)
                </button>
                <button
                  type="button"
                  onClick={() => setStockAction('set')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stockAction === 'set' ? 'bg-gold-500 text-black font-extrabold shadow-sm' : 'bg-white/5 text-gray-400'
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
                    onChange={(e) => setNewIngForm({ ...newIngForm, name: e.target.value })}
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
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="L">L (Litre)</option>
                    <option value="ml">ml (Millilitre)</option>
                    <option value="pieces">pieces</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={newIngForm.currentStock}
                    onChange={(e) => setNewIngForm({ ...newIngForm, currentStock: e.target.value })}
                    className="w-full glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Min Alert</label>
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
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          tx.type === 'usage_deduction'
                            ? 'bg-red-500/15 text-red-400'
                            : tx.type === 'stock_addition'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-gold-500/15 text-gold-400'
                        }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-black ${
                        tx.type === 'usage_deduction' ? 'text-red-400' : 'text-emerald-400'
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

    </div>
  );
};

export default Ingredients;
