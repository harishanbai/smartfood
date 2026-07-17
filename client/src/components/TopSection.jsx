import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

const TopSection = () => {
  const [time, setTime] = useState(new Date());

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
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Greeting & Time */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">
          {getGreeting()}, Master 👋
        </h2>
        <p className="text-gray-400 text-sm flex items-center gap-2">
          Manage tomorrow's lunch and configure recipes in real-time.
        </p>
      </div>

      {/* Date, Time & Scheduler Status Panel */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date and Clock Widget */}
        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 bg-white/5 border border-white/10 text-sm">
          <Calendar className="h-4 w-4 text-accentPurple" />
          <span className="text-gray-300 font-medium">{formatDate(time)}</span>
          <span className="h-4 w-px bg-white/10" />
          <Clock className="h-4 w-4 text-accentOrange" />
          <span className="text-gray-200 font-mono font-semibold">{formatTime(time)}</span>
        </div>

        {/* Auto Generation status widget */}
        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 bg-accentGreen/10 border border-accentGreen/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CheckCircle2 className="h-5 w-5 text-accentGreen" />
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
