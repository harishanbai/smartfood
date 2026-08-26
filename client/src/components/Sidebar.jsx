import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
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
  ChevronRight,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { language, t } = useLanguage();
  const { currentUser, logout } = useAuth();

  const [profileName, setProfileName] = useState(() => (localStorage.getItem('profileName') || '').trim() || 'Smart Lunch');
  const [profileDesignation, setProfileDesignation] = useState(() => (localStorage.getItem('profileDesignation') || '').trim() || 'MESS MASTER');
  const [appLogo, setAppLogo] = useState(() => localStorage.getItem('appLogo') || '');

  useEffect(() => {
    const handleProfileChange = () => {
      setProfileName((localStorage.getItem('profileName') || '').trim() || 'Smart Lunch');
      setProfileDesignation((localStorage.getItem('profileDesignation') || '').trim() || 'MESS MASTER');
      setAppLogo(localStorage.getItem('appLogo') || '');
    };
    window.addEventListener('profile-change', handleProfileChange);
    return () => window.removeEventListener('profile-change', handleProfileChange);
  }, []);

  const menuItems = useMemo(() => [
    { name: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('common.ingredients'), path: '/ingredients', icon: ShoppingBag },
    { name: t('common.foods'), path: '/foods', icon: UtensilsCrossed },
    { name: t('common.history'), path: '/history', icon: History },
    { name: t('common.calendar'), path: '/calendar', icon: Calendar },
    { name: t('common.statistics'), path: '/statistics', icon: BarChart3 },
    { name: t('common.settings'), path: '/settings', icon: Settings },
    { name: t('common.payment'), path: '/payment', icon: CreditCard },
  ], [t]);

  return (
    <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20 p-4' : 'w-64 p-6'} bg-sidebarBg flex-col z-40 transition-[width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width,padding] border-r border-sidebarBorder shadow-2xl`}>
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3.5 top-8 h-7 w-7 rounded-full bg-sidebarBg border border-sidebarBorder items-center justify-center shadow-md cursor-pointer z-50 text-sidebarText/70 hover:text-sidebarText hover:scale-105 transition-[transform,color] duration-200"
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
        className={`flex items-center gap-3 mb-10 px-2 group hover:opacity-90 transition-opacity duration-200 cursor-pointer ${isCollapsed ? 'justify-center mb-8' : ''}`}
      >
        <div className="h-11 w-11 rounded-xl bg-[#0a2318] flex items-center justify-center shadow-lg shadow-emerald-950/40 overflow-hidden flex-shrink-0 border border-emerald-500/30 group-hover:border-emerald-400/60 transition-colors duration-200">
          <img
            src={appLogo || logoImg}
            alt={profileName || 'Smart Lunch'}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[150px] opacity-100 translate-x-0'}`}>
          <h1 className="font-extrabold text-base tracking-tight text-[#D4AF37] truncate max-w-[140px] drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]">
            {profileName || 'Smart Lunch'}
          </h1>
          <span className="text-[10px] text-accentOrange font-bold uppercase tracking-wider block truncate max-w-[140px] mt-0.5">{profileDesignation || 'MESS MASTER'}</span>
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
                flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3.5'} rounded-xl text-sm font-semibold transition-[padding,background-color,border-color,color,transform,box-shadow] duration-200 ease-out group relative overflow-hidden transform hover:-translate-y-0.5
                ${isActive
                  ? 'active text-accentOrange bg-sidebarActive border border-accentOrange/40 shadow-[0_0_16px_rgba(212,175,55,0.25)]'
                  : 'text-sidebarText hover:text-sidebarText hover:bg-sidebarHover border border-transparent'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Subtle animated shimmer background on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-accentOrange/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-accentOrange drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'text-sidebarText/80 group-hover:text-sidebarText'}`} />
                  <span className={`relative z-10 font-bold whitespace-nowrap overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[160px] opacity-100 translate-x-0'}`}>{item.name}</span>

                  {isActive && !isCollapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l bg-accentOrange animate-pulse shadow-[0_0_12px_rgba(212,175,55,0.9)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom status indicator & Logout */}
      <div className="mt-auto pt-6 border-t border-sidebarBorder/50">
        {currentUser && (
          <button
            onClick={logout}
            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'} rounded-xl text-sm font-semibold transition-[padding,background-color,border-color,color] duration-200 text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/10 w-full text-left cursor-pointer`}
            title={isCollapsed ? (language === 'ta' ? 'வெளியேறு' : 'Log Out') : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[160px] opacity-100 translate-x-0'}`}>{language === 'ta' ? 'வெளியேறு' : 'Log Out'}</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);

