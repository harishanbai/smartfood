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
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { language, t } = useLanguage();
  const { currentUser, logout } = useAuth();

  const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Smart Lunch');
  const [profileDesignation, setProfileDesignation] = useState(() => localStorage.getItem('profileDesignation') || 'MESS MASTER');

  useEffect(() => {
    const handleProfileChange = () => {
      setProfileName(localStorage.getItem('profileName') || 'Smart Lunch');
      setProfileDesignation(localStorage.getItem('profileDesignation') || 'MESS MASTER');
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
    <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20 p-4' : 'w-64 p-6'} bg-[#6C5DD3] flex-col z-40 transition-all duration-300 border-r border-white/10 shadow-2xl`}>
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3.5 top-8 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 items-center justify-center shadow-md cursor-pointer z-50 text-gray-500 hover:text-gray-700 hover:scale-105 transition-all"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Brand Header */}
      <Link 
        to="/profile" 
        className={`flex items-center gap-3 mb-10 px-2 group hover:opacity-90 transition-all cursor-pointer ${isCollapsed ? 'justify-center mb-8' : ''}`}
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accentPurple to-accentOrange flex items-center justify-center shadow-lg shadow-purple-500/25 overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-accentPurple/45 transition-all duration-300">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? 'w-0 h-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
          <h1 className="font-extrabold text-base tracking-tight text-white transition-colors duration-300 truncate max-w-[140px]">{profileName}</h1>
          <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block truncate max-w-[140px] mt-0.5">{profileDesignation}</span>
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
                flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3.5'} rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'text-white bg-white/20 border border-white/20 shadow-md' 
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Glow effect on active item hover */}
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                  <span className={`relative z-10 transition-all duration-300 ${isCollapsed ? 'w-0 h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>{item.name}</span>

                  {isActive && !isCollapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom status indicator & Logout */}
      <div className="mt-auto pt-6 border-t border-white/5">
        {currentUser && (
          <button
            onClick={logout}
            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'} rounded-xl text-sm font-semibold transition-all duration-300 text-red-200 hover:text-white hover:bg-red-500/20 border border-red-500/10 w-full text-left cursor-pointer`}
            title={isCollapsed ? (language === 'ta' ? 'வெளியேறு' : 'Log Out') : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>{language === 'ta' ? 'வெளியேறு' : 'Log Out'}</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
