import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, RefreshCw, AlertCircle, CalendarRange, Bell, CheckCircle,
  Sun, Moon, Star, Flame, Info, Calendar, MessageSquare, CreditCard, ShoppingBag, Trash2,
  PartyPopper, Leaf, UtensilsCrossed, Dices, CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { menuApi, foodApi, tamilCalendarApi, holidayApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { getImageUrl, getFallbackFoodImage } from '../utils/imageUtils';
import PremiumCarousel from '../components/PremiumCarousel';
import NotificationsPanel from '../components/NotificationsPanel';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmContext';
// ─────────────────────────────────────────────────────────────────────────────
// Rule Badge — displays which rule was applied for menu generation
// ─────────────────────────────────────────────────────────────────────────────
const RuleBadge = ({ ruleCode, ruleApplied }) => {
  if (!ruleCode) return null;

  const config = {
    festival: { bg: 'bg-violet-500/15', border: 'border-violet-500/35', text: 'text-violet-300', Icon: PartyPopper, label: ruleApplied || 'Festival – Veg Only' },
    viratham: { bg: 'bg-pink-500/15', border: 'border-pink-500/35', text: 'text-pink-300', Icon: Flame, label: ruleApplied || 'Viratham – Veg Only' },
    amavasai: { bg: 'bg-indigo-500/15', border: 'border-indigo-500/35', text: 'text-indigo-300', Icon: Moon, label: ruleApplied || 'Amavasai – Veg Only' },
    pournami: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', Icon: Sun, label: ruleApplied || 'Pournami – Veg Only' },
    wednesday: { bg: 'bg-orange-500/15', border: 'border-orange-500/35', text: 'text-orange-300', Icon: UtensilsCrossed, label: ruleApplied || 'Company Rule – Wednesday Non-Veg' },
    normal: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', Icon: Dices, label: ruleApplied || 'Normal Day' },
  };

  const c = config[ruleCode] || config.normal;
  // Strip leading emoji from label if present (data from server may have them)
  const cleanLabel = typeof c.label === 'string' ? c.label.replace(/^[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/u, '').trim() : c.label;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold tracking-wide ${c.bg} ${c.border} ${c.text}`}>
      <c.Icon className="h-3 w-3 flex-shrink-0" />
      <span>{cleanLabel}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tamil Calendar Card — shows today's Tamil panchang details
// ─────────────────────────────────────────────────────────────────────────────
const TamilCalendarCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] shadow-[var(--dash-shadow-card)] relative overflow-hidden animate-pulse">
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
    { label: 'Tamil Date', value: tc?.tamilDate, icon: <Calendar className="h-3.5 w-3.5" /> },
    { label: 'Tamil Month', value: tc?.tamilMonth, icon: <Sun className="h-3.5 w-3.5" /> },
    { label: 'Tithi', value: tc?.tithi, icon: <Moon className="h-3.5 w-3.5" /> },
    { label: 'Nakshatra', value: tc?.nakshatra, icon: <Star className="h-3.5 w-3.5" /> },
    { label: 'Sunrise', value: tc?.sunrise, icon: <Sun className="h-3.5 w-3.5 text-amber-400" /> },
    { label: 'Sunset', value: tc?.sunset, icon: <Moon className="h-3.5 w-3.5 text-orange-400" /> },
  ];

  return (
    <div className="dash-card-hover rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] shadow-[var(--dash-shadow-card)] relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase font-bold tracking-wider text-[var(--dash-text-label)] flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Tamil Calendar
        </span>
        {!apiAvailable && (
          <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
            API Offline
          </span>
        )}
      </div>

      {apiAvailable && tc ? (
        <>
          {/* Festival / Viratham / Amavasai / Pournami banners */}
          {tc.isFestival && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/12 border border-violet-500/25">
              <PartyPopper className="h-4 w-4 text-violet-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Festival Today</p>
                <p className="text-xs text-[var(--dash-text-section)] font-semibold">{tc.festivalName}</p>
              </div>
            </div>
          )}
          {tc.isViratham && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/12 border border-pink-500/25">
              <Flame className="h-4 w-4 text-pink-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-pink-300 uppercase tracking-wider">Viratham Today</p>
                <p className="text-xs text-[var(--dash-text-section)] font-semibold">{tc.virathamName || 'Auspicious Fasting'}</p>
              </div>
            </div>
          )}
          {tc.isAmavasai && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/12 border border-indigo-500/25">
              <Moon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <p className="text-xs font-bold text-indigo-300">Amavasai (No Moon Day)</p>
            </div>
          )}
          {tc.isPournami && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sun className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-300">Pournami (Full Moon Day)</p>
            </div>
          )}

          {/* Data grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {fields.map((f) => (
              <div key={f.label} className="bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] rounded-xl p-2.5 hover:bg-[var(--dash-status-track)] transition-colors">
                <div className="flex items-center gap-1.5 text-[var(--dash-text-muted)] mb-0.5">
                  {f.icon}
                  <span className="text-[9px] uppercase tracking-wider font-semibold">{f.label}</span>
                </div>
                <p className="text-xs font-semibold text-[var(--dash-text-section)] truncate">{f.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Rule Applied for Tomorrow */}
          {rule && (
            <div className="pt-3 border-t border-[var(--dash-inner-border)]">
              <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-1.5 font-semibold">Tomorrow's Rule</p>
              <RuleBadge ruleCode={rule.ruleCode} ruleApplied={rule.ruleApplied} />
              {rule.festivalName && (
                <p className="text-[10px] text-[var(--dash-text-muted)] mt-1.5">Festival: <span className="text-[var(--dash-text-section)] font-medium">{rule.festivalName}</span></p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Info className="h-8 w-8 text-[var(--dash-text-muted)] mb-2" />
          <p className="text-xs text-[var(--dash-text-muted)] max-w-[200px]">
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
  const [openDropdown, setOpenDropdown] = useState(null); // 'today' | 'tomorrow' | null
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const carouselTriggerRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchTamilCalendar();
  }, [language]);
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (openDropdown && !event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [openDropdown]);

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
      addNotification(t('dashboard.failedFetch'), 'warning');
    }
  };

  const fetchTamilCalendar = async () => {
    setCalendarLoading(true);
    try {
      const [todayRes, tomorrowRes] = await Promise.allSettled([
        tamilCalendarApi.getToday(),
        tamilCalendarApi.getTomorrow(),
      ]);

      const todayData = todayRes.status === 'fulfilled' ? todayRes.value?.data : null;
      const tomorrowData = tomorrowRes.status === 'fulfilled' ? tomorrowRes.value?.data : null;

      console.log('Today date:', todayData?.date);
      console.log('Tomorrow date:', tomorrowData?.date);
      console.log('API Date Requested (Today):', todayData?.date);
      console.log('API Date Requested (Tomorrow):', tomorrowData?.date);
      console.log('Today API response:', todayData);
      console.log('Tomorrow API response:', tomorrowData);
      console.log('Festival Today:', todayData?.tamilCalendar?.festivalName || (todayData?.tamilCalendar?.isFestival ? 'Festival' : 'None'));
      console.log('Festival Tomorrow:', tomorrowData?.tamilCalendar?.festivalName || (tomorrowData?.tamilCalendar?.isFestival ? 'Festival' : 'None'));

      setTamilToday(todayData);
      setTamilTomorrow(tomorrowData);
    } catch (err) {
      console.error('Error fetching Tamil calendar:', err);
      setTamilToday(null);
      setTamilTomorrow(null);
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
      festival: 'info',
      viratham: 'info',
      amavasai: 'info',
      pournami: 'info',
      wednesday: 'warning',
      normal: 'success',
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

  const handleRemoveTomorrowHoliday = async () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const isConfirmed = await confirm({
      title: t('holiday.removeHolidayPromptTitle') || 'Remove Holiday?',
      message: t('holiday.removeHolidayPromptMsg') || 'This date will return to a normal working day.',
      confirmText: t('holiday.removeHolidayBtn') || 'Remove Holiday',
      cancelText: t('common.cancel') || 'Cancel',
      type: 'warning'
    });

    if (!isConfirmed) return;

    try {
      await holidayApi.removeHoliday(tomorrowStr);
      addNotification(t('holiday.removedSuccess') || 'Holiday removed successfully. Normal working day restored!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Error removing tomorrow holiday:', err);
      addNotification(err.response?.data?.message || 'Failed to remove holiday', 'warning');
    }
  };

  const handleGenerateClick = async () => {
    if (isSpinning) return;
    try {
      setCarouselMode(true);
      const res = await menuApi.generateTomorrow();
      const generatedMenu = res.data;
      const generatedFood = generatedMenu.vegFoodId || generatedMenu.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = generatedFood._id;
        spinBtn.click();
      }

      // Smart notification based on rule applied
      const ruleCode = generatedMenu.ruleCode || tamilTomorrow?.rule?.ruleCode || 'normal';
      const reason = tamilTomorrow?.rule?.reason || "Tomorrow's Lunch menu generation initiated...";
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
      const newFood = newMenu.vegFoodId || newMenu.foodId;

      const spinBtn = document.getElementById('carousel-spin-trigger');
      if (spinBtn) {
        spinBtn.dataset.foodId = newFood._id;
        spinBtn.click();
      }

      // Smart skip notification — preserve rule context
      const ruleCode = newMenu.ruleCode || tamilTomorrow?.rule?.ruleCode || 'normal';
      const ruleLabel = newMenu.ruleApplied || tamilTomorrow?.rule?.ruleApplied || 'Normal Random';
      addNotification(`Dish skipped. Next selection follows: ${ruleLabel}`, 'warning', { duration: 10000 });

      addNotification(t('dashboard.skipAlert'), 'warning', { duration: 10000 });
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'NO_CATEGORY_FOODS') {
        addNotification(errData.message, 'warning');
      } else {
        addNotification(errData?.message || 'Failed to skip menu item', 'warning');
      }
    }
  };



  const onCarouselFinished = (selectedFood) => {
    fetchData();
    setCarouselMode(false);
    addNotification(`${t('dashboard.tomorrowSelectedTitle')}: ${selectedFood.name} 🎉`, 'success');
  };

  // Resolve rule badge data: prefer live menu data, fall back to Tamil API prediction
  const tomorrowRuleCode = tomorrowMenu?.ruleCode || tamilTomorrow?.rule?.ruleCode || null;
  const tomorrowRuleApplied = tomorrowMenu?.ruleApplied || tamilTomorrow?.rule?.ruleApplied || null;

  // ── Eligible Foods Filter ────────────────────────────────────────────────────
  // Filter availableFoods based on tomorrow's rule so the wheel and dropdown
  // only show dishes permitted under the current dietary rule.
  const NON_VEG_KW = ['chicken', 'mutton', 'fish', 'prawn', 'egg', 'crab', 'lamb', 'biryani', 'kebab', 'tikka', 'keema', 'salmon', 'wings'];
  const isVeg = (f) => f.foodType ? f.foodType === 'veg' : !NON_VEG_KW.some(kw => (f.name || '').toLowerCase().includes(kw));
  const isNVeg = (f) => f.foodType ? f.foodType === 'non-veg' : NON_VEG_KW.some(kw => (f.name || '').toLowerCase().includes(kw));

  const eligibleFoods = React.useMemo(() => {
    const rule = tamilTomorrow?.rule || {};
    const code = tomorrowRuleCode;
    if (rule.isStrictVeg || ['festival', 'viratham', 'amavasai', 'pournami'].includes(code)) {
      // Strict Veg: only veg foods
      const vegOnly = availableFoods.filter(isVeg);
      return vegOnly.length > 0 ? vegOnly : availableFoods;
    }
    if (rule.isStrictNonVeg || code === 'wednesday') {
      // Wednesday: prefer non-veg, fallback to all
      const nonVeg = availableFoods.filter(isNVeg);
      return nonVeg.length > 0 ? nonVeg : availableFoods;
    }
    return availableFoods; // Normal: all
  }, [availableFoods, tomorrowRuleCode, tamilTomorrow?.rule]);

  // Keep selectedFoodId in sync when eligible pool changes
  useEffect(() => {
    if (eligibleFoods.length > 0) {
      setSelectedFoodId(prev => eligibleFoods.find(f => f._id === prev) ? prev : eligibleFoods[0]._id);
    }
  }, [eligibleFoods]);

  return (
    <div className="relative min-h-screen pb-32 lg:pb-12 w-full overflow-x-hidden">
      {/* Notification bell row */}
      <div className="flex justify-end mb-3 sm:mb-6 relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative glass-panel p-3 rounded-xl hover:bg-white/10 transition-all border border-[var(--glass-border-gold)] text-[var(--accent-orange)] hover:text-[var(--accent-orange-bright)] min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
        </button>
        <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* ── Quick Billing Alert ─────────────────────────────────────────────── */}
      {/* Actionable card: strongest visual weight — strong border + shadow */}
      <div
        className="mb-6 rounded-2xl border border-[var(--dash-card-primary-border)] bg-[var(--dash-card-bg)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ boxShadow: 'var(--dash-shadow-elevated)' }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-[var(--accent-orange)]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--dash-text-hero)]">
              {language === 'ta' ? 'மதிய உணவு சந்தா கணக்கு' : 'Active Meal Subscription Account'}
            </h4>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5 max-w-sm leading-relaxed">
              {language === 'ta'
                ? 'கட்டண விவரங்களை சரிபார்த்து, UPI QR அல்லது வங்கிப் பரிமாற்றம் மூலம் தொகையைச் செலுத்தவும்.'
                : 'Check payment details or scan UPI QR code to keep your meal subscription active.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/payment')}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(212,175,55,0.45)] cursor-pointer min-h-[38px] text-center border-none shadow-md flex-shrink-0"
          style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
        >
          {language === 'ta' ? 'பணம் செலுத்து' : 'Pay Now'}
        </button>
      </div>

      {/* ── Main Dashboard Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">

        {/* Left Side: Today, Tomorrow Cards + Tamil Calendar Card */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-6">

          {/* ── TODAY'S LUNCH MENU — Primary Hero Card (highest elevation) ── */}
          <div
            className="dash-card-primary dash-card-hover rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-primary-border)] bg-[var(--dash-card-bg)] relative overflow-hidden transition-all duration-300"
            style={{ boxShadow: 'var(--dash-shadow-elevated)' }}
          >
            {/* Subtle gold glow accent — only visual, no functional change */}
            <div className="absolute -right-16 -top-16 w-40 h-40 bg-[var(--accent-orange)]/8 rounded-full blur-[70px] pointer-events-none" />

            {/* Section label — typography hierarchy: LABEL style */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-[var(--dash-text-label)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                {t('dashboard.todayTitle')}
              </span>
              <span className="text-xs text-[var(--dash-text-muted)] font-medium font-mono">{t('dashboard.timeRange')}</span>
            </div>

            {todayMenu?.isHoliday ? (
              /* ── Holiday empty state: proportionate, icon-based ── */
              <div className="holiday-state-bloom py-6 px-4 rounded-2xl bg-[var(--dash-inner-bg)] border border-[var(--dash-card-border-accent)] text-center flex flex-col items-center justify-center space-y-3">
                <div className="holiday-icon-ring w-12 h-12 rounded-2xl bg-[var(--accent-orange)]/12 border border-[var(--accent-orange)]/25 flex items-center justify-center shadow-sm">
                  <PartyPopper className="h-6 w-6 text-[var(--accent-orange)]" />
                </div>
                <span className="px-3 py-0.5 rounded-full bg-[var(--accent-orange)]/12 border border-[var(--accent-orange)]/30 text-[var(--accent-orange)] text-[10px] font-extrabold uppercase tracking-widest">
                  {t('holiday.badge')}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[var(--dash-text-hero)] mb-0">
                  {todayMenu.holiday?.name || t('holiday.title')}
                </h4>
                {todayMenu.holiday?.name_ta && (
                  <p className="text-xs text-[var(--accent-orange)] font-semibold font-sans">
                    {todayMenu.holiday.name_ta}
                  </p>
                )}
                <p className="text-xs text-[var(--dash-text-body)] max-w-sm leading-relaxed">
                  {t('holiday.holidayNotice')} {t('holiday.holidayDesc')}
                </p>
              </div>
            ) : todayMenu ? (
              <div className="flex flex-col gap-5">
                {(() => {
                  const todayFood = todayMenu.foodId || todayMenu.vegFoodId || todayMenu.nonVegFoodId;
                  if (!todayFood) return null;
                  const isNonVeg = todayFood.foodType === 'non-veg' || (todayFood.category || '').toLowerCase().includes('non');
                  return (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start p-4 rounded-2xl bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] hover:border-[var(--dash-card-border-accent)] transition-all duration-300 w-full">
                      <div className="food-photo-frame w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-black/20 border border-[var(--dash-inner-border)] relative flex-shrink-0">
                        <img
                          src={getImageUrl(todayFood)}
                          alt={todayFood.name}
                          className="w-full h-full object-cover transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackFoodImage(todayFood);
                          }}
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isNonVeg
                          ? 'bg-red-500/15 border border-red-500/25 text-red-400'
                          : 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isNonVeg ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                          {isNonVeg ? 'NON-VEG' : 'VEG'} • {todayFood.category}
                        </span>
                        <h3 className="dash-heading text-lg font-bold text-[var(--dash-text-hero)] mt-2 mb-1 tracking-tight">{todayFood.name}</h3>
                        <p className="text-[var(--dash-text-body)] text-xs leading-relaxed">{todayFood.description}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--dash-inner-border)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Prepared &amp; Served</span>
                    </div>
                    {todayMenu.ruleCode && (
                      <RuleBadge ruleCode={todayMenu.ruleCode} ruleApplied={todayMenu.ruleApplied} />
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/ingredients', { state: { date: todayMenu?.date || getTodayStr() } })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--dash-inner-bg)] hover:bg-[var(--dash-status-track)] text-[var(--accent-orange)] border border-[var(--dash-card-border-accent)] transition-all cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{t('common.ingredients') || 'Ingredients'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-[var(--dash-text-muted)] mb-2" />
                <h4 className="font-bold text-[var(--dash-text-hero)] mb-1">{t('dashboard.noTodayMenu')}</h4>
                <p className="text-xs text-[var(--dash-text-muted)] max-w-xs">{t('dashboard.noTodaySub')}</p>
              </div>
            )}
          </div>

          {/* ── TOMORROW'S LUNCH CARD — Secondary card (balanced weight) ── */}
          <div
            className="dash-card-hover rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] relative overflow-hidden transition-all duration-300"
            style={{ boxShadow: 'var(--dash-shadow-card)' }}
          >
            <div className="absolute -right-14 -top-14 w-36 h-36 bg-[var(--accent-orange)]/6 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-[var(--dash-text-label)] flex items-center gap-2">
                <CalendarRange className="h-3.5 w-3.5" />
                {t('dashboard.tomorrowTitle')}
              </span>
              {tomorrowMenu && !tomorrowMenu.isHoliday && (() => {
                const isAuto = tomorrowMenu.generationType
                  ? (tomorrowMenu.generationType.toLowerCase() === 'automatic' || tomorrowMenu.generationType.toLowerCase() === 'auto')
                  : (tomorrowMenu.scheduledTime === '20:00' || !tomorrowMenu.generationType);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${isAuto
                    ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-500'
                    : 'bg-blue-500/10 border border-blue-500/25 text-blue-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isAuto ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                    {isAuto ? 'Auto Generated' : 'Manually Generated'}
                  </span>
                );
              })()}
            </div>

            {tomorrowMenu?.isHoliday ? (
              /* ── Holiday empty state: proportionate ── */
              <div className="holiday-state-bloom py-6 px-4 rounded-2xl bg-[var(--dash-inner-bg)] border border-[var(--dash-card-border-accent)] text-center flex flex-col items-center justify-center space-y-3">
                <div className="holiday-icon-ring w-12 h-12 rounded-2xl bg-[var(--accent-orange)]/12 border border-[var(--accent-orange)]/25 flex items-center justify-center shadow-sm">
                  <PartyPopper className="h-6 w-6 text-[var(--accent-orange)]" />
                </div>
                <span className="px-3 py-0.5 rounded-full bg-[var(--accent-orange)]/12 border border-[var(--accent-orange)]/30 text-[var(--accent-orange)] text-[10px] font-extrabold uppercase tracking-widest">
                  {t('holiday.badge')}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[var(--dash-text-hero)] mb-0">
                  {tomorrowMenu.holiday?.name || t('holiday.title')}
                </h4>
                {tomorrowMenu.holiday?.name_ta && (
                  <p className="text-xs text-[var(--accent-orange)] font-semibold font-sans">
                    {tomorrowMenu.holiday.name_ta}
                  </p>
                )}
                <p className="text-xs text-[var(--dash-text-body)] max-w-sm leading-relaxed">
                  {t('holiday.holidayNotice')} {t('holiday.holidayDesc')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    onClick={handleRemoveTomorrowHoliday}
                    className="px-5 py-2 rounded-xl bg-[var(--dash-inner-bg)] hover:bg-red-500/12 text-[var(--dash-text-body)] hover:text-red-400 border border-[var(--dash-inner-border)] hover:border-red-500/35 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t('holiday.removeHolidayBtn')}</span>
                  </button>
                </div>
              </div>
            ) : tomorrowMenu && !carouselMode ? (
              <div className="flex flex-col gap-5">
                {(() => {
                  const tomorrowFood = tomorrowMenu.foodId || tomorrowMenu.vegFoodId || tomorrowMenu.nonVegFoodId;
                  if (!tomorrowFood) return null;
                  const isNonVeg = tomorrowFood.foodType === 'non-veg' || (tomorrowFood.category || '').toLowerCase().includes('non');
                  return (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start p-4 rounded-2xl bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] hover:border-[var(--dash-card-border-accent)] transition-all duration-300 w-full">
                      <div className="food-photo-frame w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-black/20 border border-[var(--dash-inner-border)] relative flex-shrink-0">
                        <img
                          src={getImageUrl(tomorrowFood)}
                          alt={tomorrowFood.name}
                          className="w-full h-full object-cover transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackFoodImage(tomorrowFood);
                          }}
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isNonVeg
                          ? 'bg-red-500/15 border border-red-500/25 text-red-400'
                          : 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isNonVeg ? 'bg-red-400' : 'bg-emerald-400'}`} />
                          {isNonVeg ? 'NON-VEG' : 'VEG'} • {tomorrowFood.category}
                        </span>
                        <h3 className="dash-heading text-lg font-bold text-[var(--dash-text-hero)] mt-2 mb-1 tracking-tight">{tomorrowFood.name}</h3>
                        <p className="text-[var(--dash-text-body)] text-xs leading-relaxed">{tomorrowFood.description}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-col justify-between pt-3 border-t border-[var(--dash-inner-border)]">
                  {tomorrowRuleCode && (
                    <div className="mb-4">
                      <RuleBadge ruleCode={tomorrowRuleCode} ruleApplied={tomorrowRuleApplied} />
                    </div>
                  )}

                  <div className="flex flex-col xs:flex-row flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={handleSkipClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] text-[var(--dash-text-section)] hover:bg-[var(--dash-status-track)] hover:border-[var(--dash-card-border-accent)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      {t('dashboard.btnSkipMenu')}
                    </button>
                    <button
                      onClick={handleGenerateClick}
                      disabled={isSpinning}
                      className="w-full xs:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-orange-bright)] text-black font-extrabold hover:opacity-90 shadow-[0_4px_16px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                      {t('dashboard.btnRollSelect')}
                    </button>
                    <button
                      onClick={() => navigate('/ingredients', { state: { date: tomorrowMenu?.date || getTomorrowStr() } })}
                      className="w-full xs:w-auto px-4 py-3 rounded-xl text-xs font-bold bg-[var(--dash-inner-bg)] hover:bg-[var(--dash-status-track)] text-[var(--accent-orange)] border border-[var(--dash-card-border-accent)] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>{t('common.ingredients') || 'Ingredients'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : carouselMode ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-[var(--accent-orange)] border-t-transparent animate-spin mb-3" />
                <h4 className="font-bold text-[var(--dash-text-hero)] mb-1">{t('dashboard.carouselTitle')}</h4>
                <p className="text-xs text-[var(--dash-text-muted)]">{t('dashboard.spinPrompt')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                {tomorrowRuleCode && (
                  <div className="mb-4">
                    <RuleBadge ruleCode={tomorrowRuleCode} ruleApplied={tomorrowRuleApplied} />
                  </div>
                )}
                <Sparkles className="h-10 w-10 text-[var(--accent-orange)] mb-2 animate-pulse" />
                <h4 className="font-bold text-[var(--dash-text-hero)] mb-1">{t('dashboard.notSelectedTitle')}</h4>
                <p className="text-xs text-[var(--dash-text-muted)] max-w-sm mb-5">{t('dashboard.notSelectedSub')}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mt-2">
                  <button
                    onClick={handleGenerateClick}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-orange-bright)] text-black hover:opacity-90 shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('dashboard.btnRollSelect')}
                  </button>

                  {eligibleFoods.length > 0 && (
                    <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0">
                      <select
                        value={selectedFoodId}
                        onChange={(e) => setSelectedFoodId(e.target.value)}
                        className="glass-panel px-3 py-2 rounded-xl bg-[var(--dash-inner-bg)] border border-[var(--dash-card-border)] text-[var(--dash-text-section)] text-xs focus:outline-none focus:border-[var(--accent-orange)] transition-all [&>option]:bg-bgCard min-h-[44px] min-w-[150px]"
                      >
                        {eligibleFoods.map(food => (
                          <option key={food._id} value={food._id}>
                            {food.name}{food.foodType === 'non-veg' ? ' (Non-Veg)' : ' (Veg)'}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleManualSchedule}
                        disabled={assigning}
                        className="px-4 py-3 rounded-xl text-xs font-bold bg-[var(--dash-inner-bg)] hover:bg-[var(--dash-status-track)] text-[var(--dash-text-section)] border border-[var(--dash-card-border)] cursor-pointer min-h-[44px]"
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
          <div
            className="dash-card-hover rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] flex flex-col justify-between relative overflow-hidden"
            style={{ boxShadow: 'var(--dash-shadow-card)' }}
          >
            <div className="mb-4">
              <h3 className="dash-heading text-lg sm:text-xl font-bold text-[var(--dash-text-hero)] tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--accent-orange)]" />
                {t('dashboard.carouselTitle')}
              </h3>
              <p className="text-xs text-[var(--dash-text-muted)]">{t('dashboard.availableRecipesSub')}</p>
            </div>

            {/* Carousel Container */}
            <div className="my-auto">
              <PremiumCarousel
                foods={eligibleFoods}
                onSelectionComplete={onCarouselFinished}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--dash-inner-border)] text-[11px] text-[var(--dash-text-muted)] text-center">
              {t('dashboard.spinPrompt')}
            </div>
          </div>

          {/* ── Tomorrow's Tamil Calendar Info ── */}
          {!calendarLoading && tamilTomorrow && (
            <div
              className="dash-card-hover rounded-2xl p-5 sm:p-6 border border-[var(--dash-card-border)] bg-[var(--dash-card-bg)] relative overflow-hidden"
              style={{ boxShadow: 'var(--dash-shadow-card)' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--dash-text-label)]">Tomorrow's Panchang</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Tamil Date', value: tamilTomorrow.tamilCalendar.tamilDate },
                  { label: 'Tamil Month', value: tamilTomorrow.tamilCalendar.tamilMonth },
                  { label: 'Tithi', value: tamilTomorrow.tamilCalendar.tithi },
                  { label: 'Nakshatra', value: tamilTomorrow.tamilCalendar.nakshatra },
                ].map((f) => (
                  <div key={f.label} className="bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] rounded-xl p-2.5">
                    <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider font-semibold mb-0.5">{f.label}</p>
                    <p className="text-xs font-semibold text-[var(--dash-text-section)] truncate">{f.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Festival / Viratham / Amavasai / Pournami banners with icons */}
              {tamilTomorrow.tamilCalendar?.isFestival ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/12 border border-violet-500/25 mb-3">
                  <PartyPopper className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">Festival Tomorrow</p>
                    <p className="text-xs text-[var(--dash-text-section)] font-semibold">{tamilTomorrow.tamilCalendar.festivalName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--dash-inner-bg)] border border-[var(--dash-inner-border)] mb-3">
                  <CalendarDays className="h-4 w-4 text-[var(--dash-text-muted)] flex-shrink-0" />
                  <p className="text-xs font-semibold text-[var(--dash-text-muted)]">No Festival Tomorrow</p>
                </div>
              )}
              {tamilTomorrow.tamilCalendar?.isViratham && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/12 border border-pink-500/25 mb-3">
                  <Flame className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-pink-300 uppercase tracking-wider">Viratham Tomorrow</p>
                    <p className="text-xs text-[var(--dash-text-section)] font-semibold">{tamilTomorrow.tamilCalendar.virathamName || 'Auspicious Fasting'}</p>
                  </div>
                </div>
              )}
              {tamilTomorrow.tamilCalendar?.isAmavasai && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/12 border border-indigo-500/25 mb-3">
                  <Moon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <p className="text-xs font-bold text-indigo-300">Amavasai (New Moon) Tomorrow</p>
                </div>
              )}
              {tamilTomorrow.tamilCalendar?.isPournami && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                  <Sun className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs font-bold text-amber-300">Pournami (Full Moon) Tomorrow</p>
                </div>
              )}

              {/* Rule Applied for Tomorrow */}
              {tamilTomorrow.rule && (
                <div className="pt-3 border-t border-[var(--dash-inner-border)]">
                  <RuleBadge ruleCode={tamilTomorrow.rule.ruleCode} ruleApplied={tamilTomorrow.rule.ruleApplied} />
                  {tamilTomorrow.rule.reason && (
                    <p className="text-[10px] text-[var(--dash-text-muted)] mt-2 leading-relaxed">{tamilTomorrow.rule.reason}</p>
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
