import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertCircle, CalendarRange, Bell, CheckCircle } from 'lucide-react';
import { menuApi, foodApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import PremiumCarousel from '../components/PremiumCarousel';
import NotificationsPanel from '../components/NotificationsPanel';

const Dashboard = () => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [tomorrowMenu, setTomorrowMenu] = useState(null);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [carouselMode, setCarouselMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { addNotification } = useNotifications();
  const carouselTriggerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [todayRes, tomorrowRes, foodsRes] = await Promise.all([
        menuApi.getToday(),
        menuApi.getTomorrow(),
        foodApi.getFoods()
      ]);
      setTodayMenu(todayRes?.data || null);
      setTomorrowMenu(tomorrowRes?.data || null);
      setAvailableFoods(Array.isArray(foodsRes?.data) ? foodsRes.data.filter(f => f && f.available) : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setTodayMenu(null);
      setTomorrowMenu(null);
      setAvailableFoods([]);
    }
  };

  const handleGenerateClick = async () => {
    if (isSpinning) return;
    try {
      setCarouselMode(true);
      const res = await menuApi.generateTomorrow();
      const generatedFood = res.data.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = generatedFood._id;
        spinBtn.click();
      }
      
      addNotification("Tomorrow's Lunch menu generation initiated...", 'info');
    } catch (err) {
      addNotification(err.response?.data?.message || "Failed to generate lunch", 'warning');
      setCarouselMode(false);
    }
  };

  const handleSkipClick = async () => {
    if (isSpinning || !tomorrowMenu) return;
    try {
      setCarouselMode(true);
      const res = await menuApi.skipTomorrow();
      const newFood = res.data.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = newFood._id;
        spinBtn.click();
      }

      addNotification("Lunch skipped. Selecting next available menu item...", 'warning');
    } catch (err) {
      addNotification(err.response?.data?.message || "Failed to skip menu item", 'warning');
      setCarouselMode(false);
    }
  };

  const onCarouselFinished = (selectedFood) => {
    fetchData();
    setCarouselMode(false);
    addNotification(`Tomorrow's Lunch set to: ${selectedFood.name} 🎉`, 'success');
  };

  return (
    <div className="relative min-h-screen pb-12 w-full overflow-x-hidden">
      {/* Notification bell row */}
      <div className="flex justify-end mb-6 relative">
        <button 
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative glass-panel p-3 rounded-xl hover:bg-white/10 transition-all border border-white/10 text-gray-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accentPurple animate-pulse" />
        </button>
        <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* Main Dashboard Layout — stacks on mobile, two-column on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
        
        {/* Left Side: Today & Tomorrow Cards */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-6">
          
          {/* ── Today's Lunch Card ── */}
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentGreen/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accentGreen/20 transition-colors duration-500" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-accentGreen flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accentGreen animate-pulse shadow-[0_0_8px_#22C55E]" />
                Today's Lunch Menu
              </span>
              <span className="text-xs text-gray-400 font-medium font-mono">1:00 PM – 2:00 PM</span>
            </div>

            {todayMenu ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                {/* Food image */}
                <div className="w-full sm:w-36 lg:w-40 h-40 rounded-2xl overflow-hidden bg-black/20 border border-white/10 relative flex-shrink-0">
                  {todayMenu.foodId?.image ? (
                    <img
                      src={todayMenu.foodId?.image}
                      alt={todayMenu.foodId?.name || 'Food'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] bg-accentGreen/10 border border-accentGreen/30 text-accentGreen px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {todayMenu.foodId?.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-2 tracking-tight">{todayMenu.foodId?.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{todayMenu.foodId?.description}</p>
                  <div className="inline-flex items-center gap-2 text-xs text-gray-400 glass-panel px-3 py-1.5 rounded-lg bg-black/20">
                    <CheckCircle className="h-3.5 w-3.5 text-accentGreen" />
                    <span>Prepared &amp; Served</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                <h4 className="font-bold text-white mb-1">No Menu generated for Today</h4>
                <p className="text-xs text-gray-400 max-w-xs">Menus are auto-generated daily at 08:00 PM. Use the section below to plan tomorrow.</p>
              </div>
            )}
          </div>

          {/* ── Tomorrow's Lunch Card ── */}
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentOrange/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accentOrange/20 transition-colors duration-500" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-accentOrange flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-accentOrange" />
                Tomorrow's Lunch Plan
              </span>
              {tomorrowMenu && (
                <span className="text-[10px] text-gray-400 font-mono">
                  Gen: {new Date(tomorrowMenu.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {tomorrowMenu && !carouselMode ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                {/* Food image */}
                <div className="w-full sm:w-36 lg:w-40 h-40 rounded-2xl overflow-hidden bg-black/20 border border-white/10 relative flex-shrink-0">
                  {tomorrowMenu.foodId?.image ? (
                    <img
                      src={tomorrowMenu.foodId?.image}
                      alt={tomorrowMenu.foodId?.name || 'Food'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                {/* Details */}
                <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-accentOrange/10 border border-accentOrange/30 text-accentOrange px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      {tomorrowMenu.foodId?.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-2 tracking-tight">{tomorrowMenu.foodId?.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{tomorrowMenu.foodId?.description}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col xs:flex-row flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={handleSkipClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      Skip Dish
                    </button>
                    <button
                      onClick={handleGenerateClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-accentPurple to-accentOrange text-white hover:opacity-90 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                      Generate Again
                    </button>
                  </div>
                </div>
              </div>
            ) : carouselMode ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-accentPurple border-t-transparent animate-spin mb-3" />
                <h4 className="font-bold text-white mb-1">Rolling Next Recipe...</h4>
                <p className="text-xs text-gray-400">Watch the 3D Carousel spin on the panel below.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Sparkles className="h-10 w-10 text-accentPurple mb-2 animate-pulse" />
                <h4 className="font-bold text-white mb-1">Plan Tomorrow's Recipe</h4>
                <p className="text-xs text-gray-400 max-w-sm mb-5">Start by generating a random available dish from your database list.</p>
                <button
                  onClick={handleGenerateClick}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-accentPurple to-accentOrange text-white hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Tomorrow's Lunch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Premium 3D Carousel Panel */}
        <div className="col-span-1 xl:col-span-5 flex flex-col">
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accentPurple" />
                Signature Carousel
              </h3>
              <p className="text-xs text-gray-400">A dynamic 3D view of current recipes and upcoming options.</p>
            </div>

            {/* Carousel Container */}
            <div className="my-auto">
              <PremiumCarousel 
                foods={availableFoods}
                onSelectionComplete={onCarouselFinished}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-gray-500 text-center">
              Spinning uses Cover Flow 3D effects to highlight selections.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
