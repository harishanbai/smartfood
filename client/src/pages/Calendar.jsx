import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ChefHat } from 'lucide-react';
import { menuApi, foodApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { getImageUrl, getFallbackFoodImage } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDayMenu, setSelectedDayMenu] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { addNotification } = useNotifications();
  const { language, t, tc } = useLanguage();

  const locales = {
    en: 'en-US',
    ta: 'ta-IN'
  };

  const tmrwLabel = language === 'ta' ? 'நாளை' : 'Tmrw';
  const legendTmrw = language === 'ta' ? 'நாளை' : 'Tomorrow';
  const legendLabel = language === 'ta' ? 'குறியீடு' : 'Legend';

  // Helper date strings
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchMonthMenus();
    fetchAvailableFoods();
  }, [currentDate, language]);

  const fetchAvailableFoods = async () => {
    try {
      const res = await foodApi.getFoods();
      const list = Array.isArray(res?.data) ? res.data.filter(f => f && f.available) : [];
      setAvailableFoods(list);
      if (list.length > 0) {
        setSelectedFoodId(list[0]._id);
      }
    } catch (err) {
      console.error(err);
      addNotification(t('calendar.failedFetchFoods'), 'warning');
    }
  };

  const handleAssignMenu = async () => {
    if (!selectedDate || !selectedFoodId || assigning) return;
    setAssigning(true);
    try {
      await menuApi.assignMenu(selectedDate, selectedFoodId);
      addNotification('Menu successfully assigned! 🎉', 'success');
      await fetchMonthMenus();
      const foodObj = availableFoods.find(f => f._id === selectedFoodId);
      const newMenuObj = {
        date: selectedDate,
        foodId: foodObj,
        generatedAt: new Date(),
        status: 'active'
      };
      setSelectedDayMenu(newMenuObj);
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.message || 'Failed to assign menu', 'warning');
    } finally {
      setAssigning(false);
    }
  };

  const fetchMonthMenus = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const res = await menuApi.getHistory(`${year}-${month}`);
      
      // Store in object keyed by YYYY-MM-DD
      const menuMap = {};
      const historyData = Array.isArray(res?.data) ? res.data : [];
      historyData.forEach(menu => {
        if (menu && menu.date) {
          menuMap[menu.date] = menu;
        }
      });

      // Try fetching today/tomorrow in parallel, but only if they are not already in the history response
      const tomorrowStr = getTomorrowStr();
      const todayStr = getTodayStr();
      
      const fetchTmrw = tomorrowStr.startsWith(`${year}-${month}`) && !menuMap[tomorrowStr];
      const fetchToday = todayStr.startsWith(`${year}-${month}`) && !menuMap[todayStr];

      const [tomorrowRes, todayRes] = await Promise.all([
        fetchTmrw ? menuApi.getTomorrow() : Promise.resolve(null),
        fetchToday ? menuApi.getToday() : Promise.resolve(null)
      ]);

      if (tomorrowRes?.data) {
        menuMap[tomorrowStr] = tomorrowRes.data;
      }
      if (todayRes?.data) {
        menuMap[todayStr] = todayRes.data;
      }

      setMenus(menuMap);
    } catch (err) {
      console.error(err);
      addNotification('Error loading calendar items', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayMenu(null);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayMenu(null);
    setSelectedDate(null);
  };

  const daysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayIndex = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  };

  const monthLabel = () => {
    return currentDate.toLocaleString(locales[language] || 'en-US', { month: 'long', year: 'numeric' });
  };

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    if (menus[dateStr]) {
      setSelectedDayMenu(menus[dateStr]);
    } else {
      setSelectedDayMenu(null);
    }
  };

  const renderDays = () => {
    const totalDays = daysInMonth();
    const startOffset = firstDayIndex();
    const gridItems = [];
    const todayStr = getTodayStr();
    const tomorrowStr = getTomorrowStr();

    // Empty cells before start of month
    for (let i = 0; i < startOffset; i++) {
      gridItems.push(<div key={`empty-${i}`} className="h-16 sm:h-20 md:h-24" />);
    }

    // Days in month
    for (let day = 1; day <= totalDays; day++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;

      const menu = menus[dateStr];
      const isToday = dateStr === todayStr;
      const isTomorrow = dateStr === tomorrowStr;

      let borderClass = 'border-white/5';
      let bgClass = 'hover:bg-white/5';
      
      if (isToday) {
        borderClass = 'border-accentGreen/50';
        bgClass = 'bg-accentGreen/5 hover:bg-accentGreen/10';
      } else if (isTomorrow) {
        borderClass = 'border-accentOrange/50';
        bgClass = 'bg-accentOrange/5 hover:bg-accentOrange/10';
      } else if (menu) {
        borderClass = 'border-accentPurple/30';
        bgClass = 'bg-accentPurple/5 hover:bg-accentPurple/10';
      }

      gridItems.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(dateStr)}
          className={`h-16 sm:h-20 md:h-24 p-1 sm:p-2 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${borderClass} ${bgClass}`}
        >
          {/* Day number */}
          <div className="flex justify-between items-center">
            <span className={`text-[10px] sm:text-xs font-semibold ${isToday ? 'text-accentGreen' : isTomorrow ? 'text-accentOrange' : 'text-gray-400'}`}>
              {day}
            </span>
            {isToday && (
              <span className="hidden xs:inline text-[9px] bg-accentGreen/20 text-accentGreen font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase">{t('calendar.today')}</span>
            )}
            {isToday && (
              <span className="xs:hidden h-2 w-2 rounded-full bg-accentGreen flex-shrink-0" />
            )}
            {isTomorrow && (
              <span className="hidden xs:inline text-[9px] bg-accentOrange/20 text-accentOrange font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase">{tmrwLabel}</span>
            )}
            {isTomorrow && (
              <span className="xs:hidden h-2 w-2 rounded-full bg-accentOrange flex-shrink-0" />
            )}
          </div>

          {/* Dish preview — visible only on sm+ */}
          {menu ? (() => {
            const food = menu.foodId || menu.vegFoodId || menu.nonVegFoodId;
            if (!food) return null;
            const isNonVeg = food.foodType === 'non-veg' || (food.category || '').toLowerCase().includes('non');
            return (
              <div className="text-left mt-auto hidden sm:block w-full overflow-hidden">
                <p className={`text-[9px] font-semibold truncate max-w-full ${isNonVeg ? 'text-red-400' : 'text-green-400'}`}>
                  {isNonVeg ? '🍗' : '🌿'} {food.name}
                </p>
              </div>
            );
          })() : null}
          {/* Dot indicator on tiny screens */}
          {menu && (
            <div className="sm:hidden mt-auto">
              <span className={`h-1.5 w-1.5 rounded-full block ${isToday ? 'bg-accentGreen' : isTomorrow ? 'bg-accentOrange' : 'bg-accentPurple'}`} />
            </div>
          )}
        </div>
      );
    }

    return gridItems;
  };

  return (
    <div className="min-h-screen pb-12 w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Calendar Grid Container */}
      <div className="col-span-1 lg:col-span-8 glass-panel rounded-[24px] p-4 sm:p-6 border border-white/5">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">{monthLabel()}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Days label — abbreviated on tiny screens */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[8px] xs:text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div><span className="hidden xs:inline">{t('calendar.Sunday')}</span><span className="xs:hidden">{t('calendar.Sunday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Monday')}</span><span className="xs:hidden">{t('calendar.Monday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Tuesday')}</span><span className="xs:hidden">{t('calendar.Tuesday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Wednesday')}</span><span className="xs:hidden">{t('calendar.Wednesday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Thursday')}</span><span className="xs:hidden">{t('calendar.Thursday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Friday')}</span><span className="xs:hidden">{t('calendar.Friday')[0]}</span></div>
          <div><span className="hidden xs:inline">{t('calendar.Saturday')}</span><span className="xs:hidden">{t('calendar.Saturday')[0]}</span></div>
        </div>

        {/* Calendar days grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 sm:h-20 md:h-24 glass-panel rounded-xl animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {renderDays()}
          </div>
        )}
      </div>

      {/* Selected Day Info Sidebar */}
      <div className="col-span-1 lg:col-span-4">
        <div className="glass-panel rounded-[24px] p-6 border border-white/5 h-full flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accentPurple" />
              {t('calendar.selectedMenuDetails')}
            </h3>
            <p className="text-xs text-gray-400 mb-6">{t('calendar.clickAnyDay')}</p>

            {selectedDayMenu ? (
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {(() => {
                  const food = selectedDayMenu.foodId || selectedDayMenu.vegFoodId || selectedDayMenu.nonVegFoodId;
                  if (!food) return (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ChefHat className="h-10 w-10 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500">{t('calendar.noMenuScheduled')}</p>
                    </div>
                  );
                  const isNonVeg = food.foodType === 'non-veg' || (food.category || '').toLowerCase().includes('non');

                  return (
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-3">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-black/20 border border-white/10">
                        <img 
                          src={getImageUrl(food)} 
                          alt={food.name || 'Food'} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackFoodImage(food);
                          }}
                        />
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isNonVeg
                            ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                            : 'bg-accentGreen/15 border border-accentGreen/30 text-accentGreen'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isNonVeg ? 'bg-red-400' : 'bg-accentGreen'}`} />
                          {isNonVeg ? '🍗 NON-VEG' : '🌿 VEG'} • {tc(food.category)}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5 mb-1">{food.name}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{food.description}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-3 border-t border-white/5 text-[10px] text-gray-500 flex justify-between font-mono">
                  <span>Date: {selectedDayMenu.date}</span>
                  <span>Gen: {new Date(selectedDayMenu.generatedAt).toLocaleTimeString(locales[language] || 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : selectedDate ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl p-4 bg-white/5">
                  <ChefHat className="h-8 w-8 mb-2 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-400">
                    {language === 'ta' ? `${selectedDate}-க்கு உணவு திட்டமிடப்படவில்லை` : `No menu scheduled for ${selectedDate}`}
                  </span>
                </div>
                
                {availableFoods.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {language === 'ta' ? 'உணவை ஒதுக்கு' : 'Assign a Dish'}
                    </label>
                    <select
                      value={selectedFoodId}
                      onChange={(e) => setSelectedFoodId(e.target.value)}
                      className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard"
                    >
                      {availableFoods.map(food => (
                        <option key={food._id} value={food._id}>{food.name} ({tc(food.category)})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignMenu}
                      disabled={assigning}
                      className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {assigning ? (language === 'ta' ? 'திட்டமிடப்படுகிறது...' : 'Scheduling...') : (language === 'ta' ? 'உணவை திட்டமிடு' : 'Schedule Dish')}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center">{t('dashboard.noAvailableFoodsSub')}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                <ChefHat className="h-10 w-10 mb-2 text-gray-600" />
                <span className="text-xs">{t('calendar.noSelectedMenu')}</span>
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-black/20 border border-white/5 rounded-xl text-[10px] text-gray-500 leading-relaxed">
            <span className="text-white font-semibold">{legendLabel}:</span>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentGreen" /> {t('calendar.today')}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentOrange" /> {legendTmrw}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentPurple" /> {t('common.history')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
