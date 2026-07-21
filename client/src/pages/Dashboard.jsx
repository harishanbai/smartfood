import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, RefreshCw, AlertCircle, CalendarRange, Bell, CheckCircle,
  Sun, Moon, Star, Flame, Info, Calendar, MessageSquare
} from 'lucide-react';
import { menuApi, foodApi, tamilCalendarApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { getImageUrl } from '../utils/imageUtils';
import PremiumCarousel from '../components/PremiumCarousel';
import NotificationsPanel from '../components/NotificationsPanel';
import { useLanguage } from '../context/LanguageContext';

// ─────────────────────────────────────────────────────────────────────────────
// Rule Badge — displays which rule was applied for menu generation
// ─────────────────────────────────────────────────────────────────────────────
const RuleBadge = ({ ruleCode, ruleApplied }) => {
  if (!ruleCode) return null;

  const config = {
    festival:  { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', icon: '🪔', label: ruleApplied || 'Festival – Veg Only' },
    amavasai:  { bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-300', icon: '🌑', label: ruleApplied || 'Amavasai – Veg Only' },
    wednesday: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', icon: '🍗', label: ruleApplied || 'Company Rule – Wednesday Non-Veg' },
    normal:    { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: '🎲', label: ruleApplied || 'Normal Random' },
  };

  const c = config[ruleCode] || config.normal;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold tracking-wide ${c.bg} ${c.border} ${c.text}`}>
      <span>{c.icon}</span>
      <span>Rule Applied: {c.label}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tamil Calendar Card — shows today's Tamil panchang details
// ─────────────────────────────────────────────────────────────────────────────
const TamilCalendarCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden animate-pulse">
        <div className="h-4 w-36 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const tc = data?.tamilCalendar;
  const rule = data?.rule;
  const apiAvailable = data?.apiAvailable;

  const fields = [
    { label: 'Tamil Date',   value: tc?.tamilDate,   icon: <Calendar className="h-3.5 w-3.5" /> },
    { label: 'Tamil Month',  value: tc?.tamilMonth,  icon: <Sun className="h-3.5 w-3.5" /> },
    { label: 'Tithi',        value: tc?.tithi,        icon: <Moon className="h-3.5 w-3.5" /> },
    { label: 'Nakshatra',    value: tc?.nakshatra,    icon: <Star className="h-3.5 w-3.5" /> },
    { label: 'Sunrise',      value: tc?.sunrise,      icon: <Sun className="h-3.5 w-3.5 text-yellow-400" /> },
    { label: 'Sunset',       value: tc?.sunset,       icon: <Moon className="h-3.5 w-3.5 text-orange-400" /> },
  ];

  return (
    <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(168,85,247,0.08)] transition-all duration-500">
      {/* Background glow */}
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          Tamil Calendar
        </span>
        {!apiAvailable && (
          <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded-full">
            API Offline
          </span>
        )}
      </div>

      {apiAvailable && tc ? (
        <>
          {/* Festival / Amavasai / Pournami banners */}
          {tc.isFestival && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30">
              <span className="text-base">🪔</span>
              <div>
                <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Festival Today</p>
                <p className="text-xs text-white font-semibold">{tc.festivalName}</p>
              </div>
            </div>
          )}
          {tc.isAmavasai && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
              <span className="text-base">🌑</span>
              <p className="text-xs font-bold text-indigo-300">Amavasai (No Moon Day)</p>
            </div>
          )}
          {tc.isPournami && !tc.isAmavasai && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/25">
              <span className="text-base">🌕</span>
              <p className="text-xs font-bold text-yellow-300">Pournami (Full Moon Day)</p>
            </div>
          )}

          {/* Data grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {fields.map((f) => (
              <div key={f.label} className="bg-white/3 border border-white/5 rounded-xl p-2.5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                  {f.icon}
                  <span className="text-[9px] uppercase tracking-wider font-semibold">{f.label}</span>
                </div>
                <p className="text-xs font-semibold text-white truncate">{f.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Rule Applied for Tomorrow */}
          {rule && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Tomorrow's Rule</p>
              <RuleBadge ruleCode={rule.ruleCode} ruleApplied={rule.ruleApplied} />
              {rule.festivalName && (
                <p className="text-[10px] text-gray-400 mt-1.5">Festival: <span className="text-white font-medium">{rule.festivalName}</span></p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Info className="h-8 w-8 text-gray-600 mb-2" />
          <p className="text-xs text-gray-500 max-w-[200px]">
            Tamil Calendar data unavailable. Menu generation will use Normal Random mode.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [todayMenu, setTodayMenu] = useState(null);
  const [tomorrowMenu, setTomorrowMenu] = useState(null);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [carouselMode, setCarouselMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tamilToday, setTamilToday] = useState(null);
  const [tamilTomorrow, setTamilTomorrow] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const carouselTriggerRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchTamilCalendar();
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
      const list = Array.isArray(foodsRes?.data) ? foodsRes.data.filter(f => f && f.available) : [];
      setAvailableFoods(list);
      if (list.length > 0) {
        setSelectedFoodId(list[0]._id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setTodayMenu(null);
      setTomorrowMenu(null);
      setAvailableFoods([]);
    }
  };

  const fetchTamilCalendar = async () => {
    setCalendarLoading(true);
    try {
      const [todayRes, tomorrowRes] = await Promise.allSettled([
        tamilCalendarApi.getToday(),
        tamilCalendarApi.getTomorrow(),
      ]);
      setTamilToday(todayRes.status === 'fulfilled' ? todayRes.value?.data : null);
      setTamilTomorrow(tomorrowRes.status === 'fulfilled' ? tomorrowRes.value?.data : null);
    } catch (err) {
      console.error('Error fetching Tamil calendar:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  /**
   * Fires the appropriate smart notification based on the rule that was applied.
   */
  const fireRuleNotification = (ruleCode, reason) => {
    if (!ruleCode) return;
    const typeMap = {
      festival:  'info',
      amavasai:  'info',
      wednesday: 'warning',
      normal:    'success',
    };
    addNotification(reason || `Menu generated using rule: ${ruleCode}`, typeMap[ruleCode] || 'info');
  };

  const handleManualSchedule = async () => {
    if (!selectedFoodId || assigning) return;
    setAssigning(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      await menuApi.assignMenu(tomorrowStr, selectedFoodId);
      addNotification("Tomorrow's lunch scheduled successfully! 🎉", 'success');
      await fetchData();
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.message || "Failed to assign tomorrow's menu", 'warning');
    } finally {
      setAssigning(false);
    }
  };

  const handleGenerateClick = async () => {
    if (isSpinning) return;
    try {
      setCarouselMode(true);
      const res = await menuApi.generateTomorrow();
      const generatedMenu = res.data;
      const generatedFood = generatedMenu.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = generatedFood._id;
        spinBtn.click();
      }

      // Smart notification based on rule applied
      const ruleCode = generatedMenu.ruleCode || tamilTomorrow?.rule?.ruleCode || 'normal';
      const reason   = tamilTomorrow?.rule?.reason || "Tomorrow's Lunch menu generation initiated...";
      fireRuleNotification(ruleCode, reason);

      addNotification(t('dashboard.initAlert'), 'info');
    } catch (err) {
      const errData = err.response?.data;
      // Category-specific error: e.g. "No Non-Veg foods are currently available."
      if (errData?.code === 'NO_CATEGORY_FOODS') {
        addNotification(errData.message, 'warning');
      } else {
        addNotification(errData?.message || 'Failed to generate lunch', 'warning');
      }
      setCarouselMode(false);
    }
  };

  const handleSkipClick = async () => {
    if (isSpinning || !tomorrowMenu) return;
    try {
      setCarouselMode(true);
      const res = await menuApi.skipTomorrow();
      const newMenu = res.data;
      const newFood = newMenu.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = newFood._id;
        spinBtn.click();
      }

      // Smart skip notification — preserve rule context
      const ruleCode = newMenu.ruleCode || tamilTomorrow?.rule?.ruleCode || 'normal';
      const ruleLabel = newMenu.ruleApplied || tamilTomorrow?.rule?.ruleApplied || 'Normal Random';
      addNotification(`Dish skipped. Next selection follows: ${ruleLabel}`, 'warning');

      addNotification(t('dashboard.skipAlert'), 'warning');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'NO_CATEGORY_FOODS') {
        addNotification(errData.message, 'warning');
      } else {
        addNotification(errData?.message || 'Failed to skip menu item', 'warning');
      }
    }
  };

  const handleWhatsAppChef = () => {
    if (!tomorrowMenu) return;

    const chefName = localStorage.getItem('chefName') || 'Chef';
    const chefPhone = localStorage.getItem('chefPhone') || '';

    const foodName = tomorrowMenu.foodId?.name || '';
    const foodDesc = tomorrowMenu.foodId?.description || '';
    const foodCategory = tomorrowMenu.foodId?.category || '';

    // Date formatting
    const dateObj = new Date(tomorrowMenu.date);
    const dayName = dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    let msg = '';

    if (language === 'ta') {
      msg = `வணக்கம் *${chefName}*,\n` +
            `*${formattedDate} (${dayName})* நாளைய மதிய உணவு மெனு:\n\n` +
            `*உணவு:* ${foodName}\n` +
            `*வகை:* ${foodCategory}\n` +
            `*விளக்கம்:* ${foodDesc}\n\n`;

      if (tamilTomorrow?.tamilCalendar) {
        const tc = tamilTomorrow.tamilCalendar;
        msg += `*தமிழ் நாட்காட்டி விபரம்:*\n` +
               `- தமிழ் தேதி: ${tc.tamilDate || '—'}\n` +
               `- தமிழ் மாதம்: ${tc.tamilMonth || '—'}\n` +
               `- திதி: ${tc.tithi || '—'}\n` +
               `- நட்சத்திரம்: ${tc.nakshatra || '—'}\n`;
        if (tc.isFestival && tc.festivalName) {
          msg += `- பண்டிகை: 🪔 ${tc.festivalName}\n`;
        }
      }

      if (tamilTomorrow?.rule) {
        msg += `\n*பயன்படுத்தப்பட்ட விதி:*\n` +
               `- ${tamilTomorrow.rule.ruleApplied || 'சாதாரண சீரற்ற முறை'}\n` +
               `- காரணம்: ${tamilTomorrow.rule.reason || '—'}\n`;
      }
    } else {
      msg = `Hello *${chefName}*,\n` +
            `Here is the lunch menu for tomorrow, *${formattedDate} (${dayName})*:\n\n` +
            `*Dish:* ${foodName}\n` +
            `*Category:* ${foodCategory}\n` +
            `*Description:* ${foodDesc}\n\n`;

      if (tamilTomorrow?.tamilCalendar) {
        const tc = tamilTomorrow.tamilCalendar;
        msg += `*Tamil Panchang Details:*\n` +
               `- Tamil Date: ${tc.tamilDate || '—'}\n` +
               `- Tamil Month: ${tc.tamilMonth || '—'}\n` +
               `- Tithi: ${tc.tithi || '—'}\n` +
               `- Nakshatra: ${tc.nakshatra || '—'}\n`;
        if (tc.isFestival && tc.festivalName) {
          msg += `- Festival Today: 🪔 ${tc.festivalName}\n`;
        }
      }

      if (tamilTomorrow?.rule) {
        msg += `\n*Rule Applied:*\n` +
               `- ${tamilTomorrow.rule.ruleApplied || 'Normal Random'}\n` +
               `- Reason: ${tamilTomorrow.rule.reason || '—'}\n`;
      }
    }

    msg += `\nThank you! / நன்றி!`;

    // WhatsApp URL
    const cleanPhone = chefPhone.replace(/[^+\d]/g, ''); // keep numbers and +
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
  };

  const onCarouselFinished = (selectedFood) => {
    fetchData();
    setCarouselMode(false);
    addNotification(`${t('dashboard.tomorrowSelectedTitle')}: ${selectedFood.name} 🎉`, 'success');
  };

  // Resolve rule badge data: prefer live menu data, fall back to Tamil API prediction
  const tomorrowRuleCode    = tomorrowMenu?.ruleCode    || tamilTomorrow?.rule?.ruleCode    || null;
  const tomorrowRuleApplied = tomorrowMenu?.ruleApplied || tamilTomorrow?.rule?.ruleApplied || null;

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

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">

        {/* Left Side: Today, Tomorrow Cards + Tamil Calendar Card */}
        {/* Left Side: Today & Tomorrow Cards */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-6">

          {/* ── Today's Lunch Card ── */}
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentGreen/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accentGreen/20 transition-colors duration-500" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-accentGreen flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accentGreen animate-pulse shadow-[0_0_8px_#22C55E]" />
                {t('dashboard.todayTitle')}
              </span>
              <span className="text-xs text-gray-400 font-medium font-mono">{t('dashboard.timeRange')}</span>
            </div>

            {todayMenu ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="w-full sm:w-36 lg:w-40 h-40 rounded-2xl overflow-hidden bg-black/20 border border-white/10 relative flex-shrink-0">
                  {todayMenu.foodId?.image ? (
                    <img
                      src={getImageUrl(todayMenu.foodId?.image)}
                      alt={todayMenu.foodId?.name || 'Food'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] bg-accentGreen/10 border border-accentGreen/30 text-accentGreen px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {todayMenu.foodId?.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-2 tracking-tight">{todayMenu.foodId?.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{todayMenu.foodId?.description}</p>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-400 glass-panel px-3 py-1.5 rounded-lg bg-black/20">
                      <CheckCircle className="h-3.5 w-3.5 text-accentGreen" />
                      <span>Prepared &amp; Served</span>
                    </div>
                    {/* Rule badge for today's menu */}
                    {todayMenu.ruleCode && (
                      <RuleBadge ruleCode={todayMenu.ruleCode} ruleApplied={todayMenu.ruleApplied} />
                    )}
                  </div>
                </div>
              </div>

            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                <h4 className="font-bold text-white mb-1">{t('dashboard.noTodayMenu')}</h4>
                <p className="text-xs text-gray-400 max-w-xs">{t('dashboard.noTodaySub')}</p>
              </div>
            )}
          </div>

          {/* ── Tomorrow's Lunch Card ── */}
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentOrange/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accentOrange/20 transition-colors duration-500" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-accentOrange flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-accentOrange" />
                {t('dashboard.tomorrowTitle')}
              </span>
              {tomorrowMenu && (
                <span className="text-[10px] text-gray-400 font-mono">
                  {tomorrowMenu.generationType === 'manual'
                    ? 'Manually Generated'
                    : `Auto Generated at ${new Date(tomorrowMenu.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              )}
            </div>

            {tomorrowMenu && !carouselMode ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                <div className="w-full sm:w-36 lg:w-40 h-40 rounded-2xl overflow-hidden bg-black/20 border border-white/10 relative flex-shrink-0">
                  {tomorrowMenu.foodId?.image ? (
                    <img
                      src={getImageUrl(tomorrowMenu.foodId?.image)}
                      alt={tomorrowMenu.foodId?.name || 'Food'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-accentOrange/10 border border-accentOrange/30 text-accentOrange px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      {tomorrowMenu.foodId?.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-2 tracking-tight">{tomorrowMenu.foodId?.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{tomorrowMenu.foodId?.description}</p>

                    {/* ── Rule Applied Badge ── */}
                    {tomorrowRuleCode && (
                      <div className="mb-4">
                        <RuleBadge ruleCode={tomorrowRuleCode} ruleApplied={tomorrowRuleApplied} />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col xs:flex-row flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={handleSkipClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      {t('dashboard.btnSkipMenu')}
                    </button>
                    <button
                      onClick={handleGenerateClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-accentPurple to-accentOrange text-white hover:opacity-90 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                      {t('dashboard.btnRollSelect')}
                    </button>
                    <button
                      onClick={handleWhatsAppChef}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-accentGreen/10 border border-accentGreen/30 text-accentGreen hover:bg-accentGreen/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {t('dashboard.btnMessageChef')}
                    </button>
                  </div>
                </div>
              </div>
            ) : carouselMode ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-accentPurple border-t-transparent animate-spin mb-3" />
                <h4 className="font-bold text-white mb-1">{t('dashboard.carouselTitle')}</h4>
                <p className="text-xs text-gray-400">{t('dashboard.spinPrompt')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                {/* Pre-generation rule preview */}
                {tomorrowRuleCode && (
                  <div className="mb-4">
                    <RuleBadge ruleCode={tomorrowRuleCode} ruleApplied={tomorrowRuleApplied} />
                  </div>
                )}
                <Sparkles className="h-10 w-10 text-accentPurple mb-2 animate-pulse" />
                <h4 className="font-bold text-white mb-1">{t('dashboard.notSelectedTitle')}</h4>
                <p className="text-xs text-gray-400 max-w-sm mb-5">{t('dashboard.notSelectedSub')}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mt-2">
                  <button
                    onClick={handleGenerateClick}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-accentPurple to-accentOrange text-white hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('dashboard.btnRollSelect')}
                  </button>

                  {availableFoods.length > 0 && (
                    <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0">
                      <select
                        value={selectedFoodId}
                        onChange={(e) => setSelectedFoodId(e.target.value)}
                        className="glass-panel px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard min-h-[44px] min-w-[150px]"
                      >
                        {availableFoods.map(food => (
                          <option key={food._id} value={food._id}>{food.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleManualSchedule}
                        disabled={assigning}
                        className="px-4 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer min-h-[44px]"
                      >
                        {assigning ? '...' : 'Schedule'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── Tamil Calendar Card ── */}
          <TamilCalendarCard data={tamilToday} loading={calendarLoading} />

        </div>

        {/* Right Side: Premium 3D Carousel Panel */}
        <div className="col-span-1 xl:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-[24px] p-5 sm:p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accentPurple" />
                {t('dashboard.carouselTitle')}
              </h3>
              <p className="text-xs text-gray-400">{t('dashboard.availableRecipesSub')}</p>
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
              {t('dashboard.spinPrompt')}
            </div>
          </div>

          {/* ── Tomorrow's Tamil Calendar Info ── */}
          {!calendarLoading && tamilTomorrow?.tamilCalendar && (
            <div className="glass-panel rounded-[24px] p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/8 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-orange-300">Tomorrow's Panchang</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Tamil Date',  value: tamilTomorrow.tamilCalendar.tamilDate },
                  { label: 'Tamil Month', value: tamilTomorrow.tamilCalendar.tamilMonth },
                  { label: 'Tithi',       value: tamilTomorrow.tamilCalendar.tithi },
                  { label: 'Nakshatra',   value: tamilTomorrow.tamilCalendar.nakshatra },
                ].map((f) => (
                  <div key={f.label} className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">{f.label}</p>
                    <p className="text-xs font-semibold text-white truncate">{f.value || '—'}</p>
                  </div>
                ))}
              </div>

              {tamilTomorrow.tamilCalendar.isFestival && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 mb-3">
                  <span>🪔</span>
                  <div>
                    <p className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Festival Tomorrow</p>
                    <p className="text-xs text-white font-semibold">{tamilTomorrow.tamilCalendar.festivalName}</p>
                  </div>
                </div>
              )}
              {tamilTomorrow.tamilCalendar.isAmavasai && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 mb-3">
                  <span>🌑</span>
                  <p className="text-xs font-bold text-indigo-300">Amavasai Tomorrow</p>
                </div>
              )}

              {/* Rule Applied for Tomorrow */}
              {tamilTomorrow.rule && (
                <div className="pt-3 border-t border-white/5">
                  <RuleBadge ruleCode={tamilTomorrow.rule.ruleCode} ruleApplied={tamilTomorrow.rule.ruleApplied} />
                  {tamilTomorrow.rule.reason && (
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{tamilTomorrow.rule.reason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
