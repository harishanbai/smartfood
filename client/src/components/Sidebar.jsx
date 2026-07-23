import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  History, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChefHat,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { language, t } = useLanguage();
  const { currentUser, logout } = useAuth();

  const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Smart Lunch');
  const [profileDesignation, setProfileDesignation] = useState(() => localStorage.getItem('profileDesignation') || 'MESS MASTER');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('profilePhoto') || '');

  useEffect(() => {
    const handleProfileChange = () => {
      setProfileName(localStorage.getItem('profileName') || 'Smart Lunch');
      setProfileDesignation(localStorage.getItem('profileDesignation') || 'MESS MASTER');
      setProfilePhoto(localStorage.getItem('profilePhoto') || '');
    };
    window.addEventListener('profile-change', handleProfileChange);
    return () => window.removeEventListener('profile-change', handleProfileChange);
  }, []);

  const menuItems = [
    { name: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('common.foods'), path: '/foods', icon: UtensilsCrossed },
    { name: t('common.history'), path: '/history', icon: History },
    { name: t('common.calendar'), path: '/calendar', icon: Calendar },
    { name: t('common.statistics'), path: '/statistics', icon: BarChart3 },
    { name: t('common.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-64 glass-panel rounded-[24px] p-6 flex-col z-40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      {/* Brand Header */}
      <Link 
        to="/profile" 
        className="flex items-center gap-3 mb-10 px-2 group hover:opacity-90 transition-all cursor-pointer"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accentPurple to-accentOrange flex items-center justify-center shadow-lg shadow-purple-500/25 overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-accentPurple/45 transition-all duration-300">
          {profilePhoto ? (
            <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover" />
          ) : (
            <ChefHat className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-extrabold text-base tracking-tight text-white group-hover:text-accentPurple transition-colors duration-300 truncate max-w-[140px]">{profileName}</h1>
          <span className="text-[10px] text-accentPurple font-bold uppercase tracking-wider block truncate max-w-[140px] mt-0.5">{profileDesignation}</span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'text-white bg-gradient-to-r from-accentPurple/20 to-accentOrange/10 border border-accentPurple/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Glow effect on active item hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-accentPurple/10 to-accentOrange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-accentPurple' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="relative z-10">{item.name}</span>

                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l bg-accentPurple shadow-[0_0_10px_#A855F7]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom status indicator & Logout */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 w-full text-left cursor-pointer"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>{language === 'ta' ? 'வெளியேறு' : 'Log Out'}</span>
          </button>
        )}

        <div className="glass-panel rounded-xl p-3 text-xs bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse shadow-[0_0_8px_#22C55E]" />
            <span className="text-gray-400 font-medium">{t('common.serviceOnline')}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
