import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, Sun, Moon, Globe, ChevronDown, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const TopSection = () => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, mongoUser, logout } = useAuth();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [chefName, setChefName] = useState(() => {
    const lang = localStorage.getItem('language') || 'en';
    return localStorage.getItem(`chefName_${lang}`) || localStorage.getItem('chefName') || '';
  });

  const langRef = useRef(null);
  const profileRef = useRef(null);

  const languagesList = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  const activeLang = languagesList.find(l => l.code === language) || languagesList[0];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleProfileChange = () => {
      const lang = localStorage.getItem('language') || 'en';
      setChefName(localStorage.getItem(`chefName_${lang}`) || localStorage.getItem('chefName') || '');
    };
    window.addEventListener('profile-change', handleProfileChange);
    window.addEventListener('language-change', handleProfileChange);
    return () => {
      window.removeEventListener('profile-change', handleProfileChange);
      window.removeEventListener('language-change', handleProfileChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hours = time.getHours();
    if (hours < 12) return t('topSection.goodMorning');
    if (hours < 17) return t('topSection.goodAfternoon');
    return t('topSection.goodEvening');
  };

  const formatDate = (date) => {
    const locales = {
      en: 'en-US',
      ta: 'ta-IN'
    };
    return date.toLocaleDateString(locales[language] || 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userPhoto = mongoUser?.photo || currentUser?.photoURL || localStorage.getItem('userProfilePhoto') || '';

  return (
    <header className="header-container mb-4 w-full relative">
      {/* Left Section */}
      <div className="left-section">
        <h2 className="greeting-title text-title tracking-tight font-extrabold">
          {(() => {
            let name = currentUser?.displayName || chefName || '';
            // If the name is essentially a phone number (digits and optional + or dashes), treat it as empty
            if (/^\+?[\d\s-]+$/.test(name)) name = '';
            name = name ? name.trim().split(' ')[0] : '';
            
            if (name && !['undefined', 'null', 'user'].includes(name.toLowerCase())) {
              return `${getGreeting()}, ${name} 👋`;
            }
            return `${getGreeting()} 👋`;
          })()}
        </h2>
        <p className="subtitle-text text-body-muted">
          {t('topSection.subtitle')}
        </p>
      </div>

      {/* Right Section */}
      <div className="right-section">
        {/* Row for Theme on Mobile */}
        <div className="lang-theme-row">

          {/* 2. Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="glass-panel theme-toggle flex items-center justify-center border border-[rgba(34,197,94,0.45)] hover:border-[rgba(34,197,94,0.7)] transition-all text-title cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="relative h-4.5 w-4.5 flex items-center justify-center">
              <Sun className={`h-4.5 w-4.5 text-accentOrange absolute transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
              <Moon className={`h-4.5 w-4.5 text-accentGreen absolute transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
            </div>
          </button>
        </div>

        {/* 3. Date Card */}
        <div className="glass-panel date-card flex items-center gap-2.5 border border-[rgba(212,175,55,0.45)] text-xs font-semibold text-title shadow-sm">
          <Calendar className="h-4 w-4 text-accentOrange flex-shrink-0" />
          <span className="hidden sm:inline">{formatDate(time)}</span>
          <span className="sm:hidden">{time.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* 4. Generation Mode Badge */}
        <div className="glass-panel autogen-card flex items-center gap-2 border border-[rgba(34,197,94,0.45)] shadow-sm shadow-emerald-500/10">
          <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse shadow-[0_0_8px_#22C55E]" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-accentGreen flex items-center gap-1.5">
            {t('topSection.autoGeneration')}
            <span className="font-mono text-title text-xs font-bold">08:00 PM</span>
          </span>
        </div>

        {/* 5. User Profile Avatar */}
        {currentUser && (
          <div className="avatar-container" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              title={currentUser.displayName || 'User Profile'}
              className="relative avatar-button flex-shrink-0 rounded-full bg-gradient-to-tr from-accentPurple to-accentOrange p-[2px] transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-[0_4px_16px_rgba(212,175,55,0.25)] group"
            >
              {/* Circular Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                {userPhoto && !imgError ? (
                  <img
                    src={userPhoto}
                    alt={currentUser.displayName || 'User'}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-accentPurple/20 flex items-center justify-center text-accentPurple font-black text-sm">
                    {getUserInitials(currentUser.displayName)}
                  </div>
                )}
              </div>
              
              {/* Online Status Indicator */}
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-accentGreen border-2 border-slate-900 rounded-full shadow-md" />
            </button>

            {/* Profile Dropdown Popover */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl border border-[rgba(34,197,94,0.45)] bg-bgCard/95 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                    {userPhoto && !imgError ? (
                      <img
                        src={userPhoto}
                        alt={currentUser.displayName || 'User'}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-emerald-400">
                        {getUserInitials(currentUser?.displayName || mongoUser?.displayName)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {currentUser?.displayName || mongoUser?.displayName || 'SmartFood User'}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {currentUser?.email || mongoUser?.email || currentUser?.phone || mongoUser?.phone || 'Connected'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(mongoUser?.provider === 'google' || currentUser?.email) && (
                        <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          ✓ Google Connected
                        </span>
                      )}
                      {(mongoUser?.provider === 'whatsapp' || mongoUser?.phone || mongoUser?.whatsappVerified) && (
                        <span className="inline-block text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          ✓ WhatsApp Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopSection;
