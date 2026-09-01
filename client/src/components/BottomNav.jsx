import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag,
  Settings, 
  MoreVertical,
  History, 
  Calendar, 
  BarChart3, 
  CreditCard,
  User,
  Package,
  CalendarDays,
  ChefHat,
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BottomNav = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // 1. Four Primary Navigation Items for Mobile Bar
  const primaryItems = [
    { name: t('common.dashboard') || 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: t('common.foods') || 'Foods', path: '/foods', icon: UtensilsCrossed },
    { name: language === 'ta' ? 'பொருட்கள்' : 'Ingredients', path: '/ingredients', icon: ShoppingBag },
    { name: t('common.settings') || 'Settings', path: '/settings', icon: Settings },
  ];

  // 2. All Remaining Features inside the "More" Menu
  const moreItems = [
    {
      name: t('common.history') || 'History',
      path: '/history',
      icon: History,
      description: language === 'ta' ? 'முந்தைய மதிய உணவு பதிவுகள்' : 'Past served lunch logs',
      badge: null
    },
    {
      name: t('common.calendar') || 'Calendar',
      path: '/calendar',
      icon: Calendar,
      description: language === 'ta' ? 'மாதாந்திர அட்டவணை & விடுமுறைகள்' : 'Monthly meal schedule & holidays',
      badge: null
    },
    {
      name: t('common.statistics') || 'Statistics',
      path: '/statistics',
      icon: BarChart3,
      description: language === 'ta' ? 'உணவு பயன்பாட்டு பகுப்பாய்வு' : 'Culinary analytics & stats',
      badge: null
    },
    {
      name: t('common.payment') || 'Payments',
      path: '/payment',
      icon: CreditCard,
      description: language === 'ta' ? 'மதிய உணவு சந்தா கணக்கு' : 'Subscription billing & QR',
      badge: null
    },
    {
      name: language === 'ta' ? 'மளிகை சேமிப்பு' : 'Grocery Storage',
      path: '/ingredients',
      state: { activeTab: 'storage' },
      icon: Package,
      description: language === 'ta' ? 'கையிருப்பு இருப்பு மேலாண்மை' : 'Storage inventory management',
      badge: null
    },
    {
      name: language === 'ta' ? 'மாதாந்திர திட்டமிடல்' : 'Monthly Planning',
      path: '/ingredients',
      state: { activeTab: 'monthly' },
      icon: CalendarDays,
      description: language === 'ta' ? 'மாதாந்திர மளிகைத் திட்டமிடல்' : 'Monthly grocery requirements',
      badge: null
    },
    {
      name: language === 'ta' ? '28 உணவு செய்முறைகள்' : '28 Dish Recipes',
      path: '/ingredients',
      state: { activeTab: 'recipes' },
      icon: ChefHat,
      description: language === 'ta' ? 'செய்முறை தேவைகள் அட்டவணை' : 'Standard dish recipe database',
      badge: null
    },
    {
      name: language === 'ta' ? 'சுயவிவரம்' : 'Profile',
      path: '/profile',
      icon: User,
      description: language === 'ta' ? 'பயனர் கணக்கு மற்றும் லோகோ' : 'Account profile & logo',
      badge: null
    }
  ];

  // Close More menu on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname, location.state]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMoreOpen]);

  // Check if any item in the More menu is currently active
  const isMoreActive = isMoreOpen || moreItems.some(item => {
    if (item.state?.activeTab) {
      return location.pathname === '/ingredients' && location.state?.activeTab === item.state.activeTab;
    }
    return location.pathname === item.path && (!item.state || location.state?.activeTab === item.state?.activeTab);
  });

  const handleMoreItemClick = (item) => {
    setIsMoreOpen(false);
    navigate(item.path, { state: item.state });
  };

  return (
    <>
      {/* ── More Features Drawer / Popover ── */}
      {isMoreOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Features Menu */}
          <div 
            ref={moreRef}
            className="fixed bottom-22 left-3 right-3 max-h-[75vh] glass-panel rounded-3xl border border-[var(--dash-card-border)] z-50 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] lg:hidden flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
            style={{ backgroundColor: 'var(--glass-bg)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--dash-inner-border)]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[var(--accent-orange)]" />
                </div>
                <h3 className="font-extrabold text-sm text-[var(--dash-text-hero)] tracking-tight">
                  {language === 'ta' ? 'அனைத்து அம்சங்கள்' : 'All Application Features'}
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--dash-text-muted)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="overflow-y-auto pr-1 grid grid-cols-2 gap-2.5 max-h-[58vh]">
              {moreItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = item.state?.activeTab
                  ? (location.pathname === '/ingredients' && location.state?.activeTab === item.state.activeTab)
                  : (location.pathname === item.path);

                return (
                  <button
                    key={`${item.name}-${idx}`}
                    onClick={() => handleMoreItemClick(item)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                      isActive 
                        ? 'bg-[var(--accent-orange)]/15 border-[var(--accent-orange)] shadow-[0_0_16px_rgba(212,175,55,0.2)]' 
                        : 'bg-[var(--dash-inner-bg)] border-[var(--dash-inner-border)] hover:border-[var(--accent-orange)]/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        isActive 
                          ? 'bg-[var(--accent-orange)] text-black font-bold' 
                          : 'bg-white/10 text-[var(--accent-orange)]'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-bold tracking-tight line-clamp-1 ${
                      isActive ? 'text-[var(--accent-orange)] font-extrabold' : 'text-[var(--dash-text-hero)]'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[var(--dash-text-muted)] line-clamp-1 mt-0.5 leading-tight">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Fixed Mobile Bottom Navigation Bar ── */}
      <div 
        className="fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl border border-[var(--dash-card-border)] z-40 flex items-center justify-between px-1.5 shadow-2xl lg:hidden" 
        style={{ backgroundColor: 'var(--glass-bg)' }}
      >
        {/* 4 Primary Navigation Items */}
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = location.pathname === item.path && !isMoreOpen;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 relative rounded-xl ${
                isItemActive ? 'scale-105 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon 
                className={`h-5 w-5 transition-transform duration-200 ${
                  isItemActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'text-gray-400'
                }`} 
                style={isItemActive ? { color: 'var(--accent-orange)' } : {}} 
              />
              <span 
                className="text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[60px]" 
                style={isItemActive ? { color: 'var(--accent-orange)' } : {}}
              >
                {item.name}
              </span>
              {isItemActive && (
                <span 
                  className="absolute -top-1 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" 
                  style={{ backgroundColor: 'var(--accent-orange)' }} 
                />
              )}
            </NavLink>
          );
        })}

        {/* 5th Navigation Item: More (3-dot menu) */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 relative rounded-xl cursor-pointer ${
            isMoreActive ? 'scale-105 font-bold' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="More Features"
          aria-expanded={isMoreOpen}
        >
          <MoreVertical 
            className={`h-5 w-5 transition-transform duration-200 ${
              isMoreActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] rotate-90' : 'text-gray-400'
            }`} 
            style={isMoreActive ? { color: 'var(--accent-orange)' } : {}} 
          />
          <span 
            className="text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[60px]" 
            style={isMoreActive ? { color: 'var(--accent-orange)' } : {}}
          >
            {language === 'ta' ? 'மேலும்' : 'More'}
          </span>
          {isMoreActive && (
            <span 
              className="absolute -top-1 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" 
              style={{ backgroundColor: 'var(--accent-orange)' }} 
            />
          )}
        </button>
      </div>
    </>
  );
};

export default BottomNav;
