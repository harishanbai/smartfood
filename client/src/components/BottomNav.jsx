import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag,
  UtensilsCrossed, 
  History, 
  Calendar, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();

  const menuItems = [
    { name: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('common.ingredients'), path: '/ingredients', icon: ShoppingBag },
    { name: t('common.foods'), path: '/foods', icon: UtensilsCrossed },
    { name: t('common.history'), path: '/history', icon: History },
    { name: t('common.calendar'), path: '/calendar', icon: Calendar },
    { name: t('common.statistics'), path: '/statistics', icon: BarChart3 },
    { name: t('common.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl border border-[var(--dash-card-border)] z-40 flex items-center justify-around px-2 shadow-2xl lg:hidden" style={{ backgroundColor: 'var(--glass-bg)' }}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 relative rounded-xl
              ${isActive ? 'scale-105 font-semibold' : 'text-gray-400 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5.5 w-5.5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-gray-400'}`} style={isActive ? { color: 'var(--accent-orange)' } : {}} />
                <span className={`text-[9px] font-medium tracking-tight mt-1 ${isActive ? '' : ''}`} style={isActive ? { color: 'var(--accent-orange)' } : {}}>
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" style={{ backgroundColor: 'var(--accent-orange)' }} />
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
