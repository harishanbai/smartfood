import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  History, 
  Calendar, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { t } = useLanguage();
  const { mongoUser } = useAuth();

  const menuItems = [
    { name: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('common.foods'), path: '/foods', icon: UtensilsCrossed },
    { name: t('common.history'), path: '/history', icon: History },
    { name: t('common.calendar'), path: '/calendar', icon: Calendar },
    { name: t('common.statistics'), path: '/statistics', icon: BarChart3 },
    ...(mongoUser?.role === 'admin' ? [{ name: t('common.settings'), path: '/settings', icon: Settings }] : []),
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl border border-white/10 z-40 flex items-center justify-around px-2 shadow-2xl lg:hidden">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 relative rounded-xl
              ${isActive ? 'text-accentPurple scale-105' : 'text-gray-400 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5.5 w-5.5 ${isActive ? 'text-accentPurple drop-shadow-[0_0_8px_#A855F7]' : 'text-gray-400'}`} />
                <span className="text-[9px] font-medium tracking-tight mt-1">{item.name}</span>
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-accentPurple shadow-[0_0_8px_#A855F7]" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNav;
