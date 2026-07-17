import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ChefHat } from 'lucide-react';
import { menuApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDayMenu, setSelectedDayMenu] = useState(null);
  const { addNotification } = useNotifications();

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
  }, [currentDate]);

  const fetchMonthMenus = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const res = await menuApi.getHistory(`${year}-${month}`);
      
      // Store in object keyed by YYYY-MM-DD
      const menuMap = {};
      res.data.forEach(menu => {
        menuMap[menu.date] = menu;
      });

      // Also try fetching tomorrow's menu if current month matches tomorrow
      const tomorrowStr = getTomorrowStr();
      if (tomorrowStr.startsWith(`${year}-${month}`)) {
        const tomorrowRes = await menuApi.getTomorrow();
        if (tomorrowRes.data) {
          menuMap[tomorrowStr] = tomorrowRes.data;
        }
      }

      // Try fetching today's menu
      const todayStr = getTodayStr();
      if (todayStr.startsWith(`${year}-${month}`)) {
        const todayRes = await menuApi.getToday();
        if (todayRes.data) {
          menuMap[todayStr] = todayRes.data;
        }
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
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayMenu(null);
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
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDayClick = (dateStr) => {
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
              <span className="hidden xs:inline text-[9px] bg-accentGreen/20 text-accentGreen font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase">Today</span>
            )}
            {isToday && (
              <span className="xs:hidden h-2 w-2 rounded-full bg-accentGreen flex-shrink-0" />
            )}
            {isTomorrow && (
              <span className="hidden xs:inline text-[9px] bg-accentOrange/20 text-accentOrange font-bold px-1 sm:px-1.5 py-0.5 rounded uppercase">Tmrw</span>
            )}
            {isTomorrow && (
              <span className="xs:hidden h-2 w-2 rounded-full bg-accentOrange flex-shrink-0" />
            )}
          </div>

          {/* Dish preview — visible only on sm+ */}
          {menu ? (
            <div className="text-left mt-auto hidden sm:block">
              <p className="text-[9px] font-medium text-white truncate max-w-full">
                {menu.foodId?.name}
              </p>
              <div className="flex gap-1 items-center mt-1">
                <span className={`h-1.5 w-1.5 rounded-full ${isToday ? 'bg-accentGreen' : isTomorrow ? 'bg-accentOrange' : 'bg-accentPurple'}`} />
                <span className="text-[8px] text-gray-500 truncate">{menu.foodId?.category}</span>
              </div>
            </div>
          ) : null}
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
          <div><span className="hidden xs:inline">Sun</span><span className="xs:hidden">S</span></div>
          <div><span className="hidden xs:inline">Mon</span><span className="xs:hidden">M</span></div>
          <div><span className="hidden xs:inline">Tue</span><span className="xs:hidden">T</span></div>
          <div><span className="hidden xs:inline">Wed</span><span className="xs:hidden">W</span></div>
          <div><span className="hidden xs:inline">Thu</span><span className="xs:hidden">T</span></div>
          <div><span className="hidden xs:inline">Fri</span><span className="xs:hidden">F</span></div>
          <div><span className="hidden xs:inline">Sat</span><span className="xs:hidden">S</span></div>
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
              Day Details
            </h3>
            <p className="text-xs text-gray-400 mb-6">Select a date in the calendar containing a recipe to view details.</p>

            {selectedDayMenu ? (
              <div className="space-y-4">
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                  {selectedDayMenu.foodId?.image ? (
                    <img src={selectedDayMenu.foodId.image} alt={selectedDayMenu.foodId.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] bg-accentPurple/20 border border-accentPurple/30 text-accentPurple px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {selectedDayMenu.foodId?.category}
                  </span>
                  <h4 className="text-xl font-bold text-white mt-2 mb-1.5">{selectedDayMenu.foodId?.name}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{selectedDayMenu.foodId?.description}</p>
                </div>
                <div className="pt-3 border-t border-white/5 text-[10px] text-gray-500 flex justify-between font-mono">
                  <span>Date: {selectedDayMenu.date}</span>
                  <span>Gen: {new Date(selectedDayMenu.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                <ChefHat className="h-10 w-10 mb-2 text-gray-600" />
                <span className="text-xs">No recipe details to display</span>
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-black/20 border border-white/5 rounded-xl text-[10px] text-gray-500 leading-relaxed">
            <span className="text-white font-semibold">Legend:</span>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentGreen" /> Today</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentOrange" /> Tomorrow</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accentPurple" /> History</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
