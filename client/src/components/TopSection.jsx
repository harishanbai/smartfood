import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopSection = () => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = time.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
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
          {getGreeting()}, Master 👋
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          Manage tomorrow's lunch and configure recipes in real-time.
        </p>
      </div>

      {/* Date, Time & Scheduler Status Panel */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full lg:w-auto">
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
            <div className="text-[10px] uppercase font-bold text-accentGreen tracking-wider">Auto Generation</div>
            <div className="text-xs text-white font-medium flex items-center gap-1.5">
              <span>08:00 PM</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accentGreen animate-ping" />
              <span className="text-accentGreen font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopSection;
