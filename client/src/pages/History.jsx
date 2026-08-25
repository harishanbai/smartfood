import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChefHat, Filter, Trash2 } from 'lucide-react';
import { menuApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { getImageUrl, getFallbackFoodImage } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmContext';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce search input to avoid spamming requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);
  const [month, setMonth] = useState(''); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();
  const { language, t, tc } = useLanguage();
  const confirm = useConfirm();

  const locales = {
    en: 'en-US',
    ta: 'ta-IN'
  };

  // Generate a list of months for filtering (current month and last 12 months)
  const getMonthFilterOptions = () => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const label = date.toLocaleString(locales[language] || 'en-US', { month: 'long', year: 'numeric' });
      options.push({ value: `${yyyy}-${mm}`, label });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  useEffect(() => {
    fetchHistory();
  }, [search, month, language]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await menuApi.getHistory(month, search);
      setHistory(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
      addNotification(t('history.failedFetchHistory'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    const isConfirmed = await confirm({
      title: t('common.delete'),
      message: t('foods.confirmDelete'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await menuApi.deleteHistory(id);
      addNotification('History log deleted successfully!', 'success');
      fetchHistory();
    } catch (err) {
      console.error(err);
      addNotification('Failed to delete history log', 'warning');
    }
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locales[language] || 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Search & Month Filter section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder={t('history.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full glass-panel pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
        </div>

        {/* Month Filter */}
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accentPurple" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full glass-panel pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard cursor-pointer"
          >
            <option value="">{t('history.monthFilterPlaceholder')}</option>
            {getMonthFilterOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Grid/List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel rounded-2xl p-4 flex gap-4 animate-pulse h-24" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-[24px] p-12 text-center max-w-lg mx-auto flex flex-col items-center">
          <ChefHat className="h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">{t('history.noHistoryRecords')}</h3>
          <p className="text-gray-400 text-sm">
            {t('history.noHistorySub')}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block glass-panel rounded-[24px] overflow-hidden border border-white/5 shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">{t('history.dish')}</th>
                    <th className="p-4">{t('foods.category')}</th>
                    <th className="p-4">{t('history.servedOn')}</th>
                    <th className="p-4">{t('history.generatedAt')}</th>
                    <th className="p-4 text-right">{t('foods.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {history.map(menu => {
                    const food = menu.foodId || menu.vegFoodId || menu.nonVegFoodId;
                    if (!food) return null;
                    const isNonVeg = food.foodType === 'non-veg' || (food.category || '').toLowerCase().includes('non');
                    return (
                      <tr key={menu._id} className="hover:bg-white/5 transition-colors align-middle">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                              <img
                                src={getImageUrl(food)}
                                alt={food.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getFallbackFoodImage(food);
                                }}
                              />
                            </div>
                            <div>
                              <span className="font-bold text-white block text-xs flex items-center gap-1.5">
                                <span>{isNonVeg ? '🍗' : '🌿'}</span>
                                <span>{food.name}</span>
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-xs truncate block mt-0.5">{food.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap ${
                            isNonVeg
                              ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                              : 'bg-accentGreen/15 border border-accentGreen/30 text-accentGreen'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isNonVeg ? 'bg-red-400' : 'bg-accentGreen'}`} />
                            {isNonVeg ? 'NON-VEG' : 'VEG'} • {tc(food.category)}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-200">{formatDateLabel(menu.date)}</td>
                        <td className="p-4 font-mono text-gray-300">
                          {new Date(menu.generatedAt).toLocaleTimeString(locales[language] || 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteHistory(menu._id)}
                            className="p-2 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-4 md:hidden">
            {history.map(menu => {
              const food = menu.foodId || menu.vegFoodId || menu.nonVegFoodId;
              if (!food) return null;
              const isNonVeg = food.foodType === 'non-veg' || (food.category || '').toLowerCase().includes('non');
              return (
                <div
                  key={menu._id}
                  className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-col items-stretch gap-4 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all"
                >
                  <div className="flex flex-row items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                      <img
                        src={getImageUrl(food)}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getFallbackFoodImage(food);
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isNonVeg
                          ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                          : 'bg-accentGreen/15 border border-accentGreen/30 text-accentGreen'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isNonVeg ? 'bg-red-400' : 'bg-accentGreen'}`} />
                        {isNonVeg ? '🍗 NON-VEG' : '🌿 VEG'} • {tc(food.category)}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 truncate">{food.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{food.description}</p>
                    </div>
                  </div>

                  {/* Right section: Generation metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accentPurple flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t('history.servedOn')}</div>
                        <span className="text-gray-200 font-semibold">{formatDateLabel(menu.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{t('history.generatedAt')}</div>
                        <span className="text-gray-300 font-mono font-medium">
                          {new Date(menu.generatedAt).toLocaleTimeString(locales[language] || 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteHistory(menu._id)}
                        className="p-1.5 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
export default History;
