import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, CheckCircle2, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TopSection = () => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
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

  const formatTime = (date) => {
    const locales = {
      en: 'en-US',
      ta: 'ta-IN'
    };
    return date.toLocaleTimeString(locales[language] || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 w-full">
      {/* Greeting & Time */}
      <div className="w-full lg:w-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
          {getGreeting()}, {t('topSection.master')} 👋
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          {t('topSection.subtitle')}
        </p>
      </div>

      {/* Date, Time & Scheduler Status Panel */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full lg:w-auto">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="glass-panel px-4 py-3 rounded-2xl flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-300 hover:text-white cursor-pointer min-h-[44px]"
          >
            <Globe className="h-4.5 w-4.5 text-accentPurple" />
            <span className="text-xs font-bold uppercase tracking-wider">{activeLang.code}</span>
            <span className="text-xs">{activeLang.flag}</span>
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-300 ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 glass-panel rounded-2xl border border-white/10 bg-bgCard/95 p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all hover:bg-white/5 cursor-pointer ${
                    language === lang.code ? 'text-accentPurple bg-white/5 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {language === lang.code && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accentPurple shadow-[0_0_6px_#A855F7]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light/Dark Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="glass-panel p-3 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-300 hover:text-white cursor-pointer min-h-[44px] min-w-[44px] relative overflow-hidden"
        >
          <div className="relative h-5 w-5 flex items-center justify-center">
            {/* Sun Icon */}
            <Sun className={`h-5 w-5 text-accentOrange absolute transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
              }`} />
            {/* Moon Icon */}
            <Moon className={`h-5 w-5 text-accentPurple absolute transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`} />
          </div>
        </button>

        {/* Date and Clock Widget */}
        <div className="glass-panel px-4 py-3 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 bg-white/5 border border-white/10 text-xs sm:text-sm flex-1 sm:flex-initial">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accentPurple flex-shrink-0" />
            <span className="text-gray-300 font-medium whitespace-nowrap">{formatDate(time)}</span>
          </div>
          <span className="hidden sm:inline h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accentOrange flex-shrink-0" />
            <span className="text-gray-200 font-mono font-semibold whitespace-nowrap">{formatTime(time)}</span>
          </div>
        </div>

        {/* Auto Generation status widget */}
        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 bg-accentGreen/10 border border-accentGreen/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] flex-1 sm:flex-initial">
          <CheckCircle2 className="h-5 w-5 text-accentGreen flex-shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-accentGreen tracking-wider">{t('topSection.autoGen')}</div>
            <div className="text-xs text-white font-medium flex items-center gap-1.5">
              <span>08:00 PM</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accentGreen animate-ping" />
              <span className="text-accentGreen font-semibold">{t('topSection.active')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopSection;
