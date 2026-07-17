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

const BottomNav = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Foods', path: '/foods', icon: UtensilsCrossed },
    { name: 'History', path: '/history', icon: History },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Stats', path: '/statistics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
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
