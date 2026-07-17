import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  History, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChefHat
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Foods', path: '/foods', icon: UtensilsCrossed },
    { name: 'History', path: '/history', icon: History },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Statistics', path: '/statistics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-64 glass-panel rounded-[24px] p-6 flex flex-col z-40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accentPurple to-accentOrange flex items-center justify-center shadow-lg shadow-purple-500/25">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Smart Lunch</h1>
          <span className="text-xs text-accentPurple font-semibold uppercase tracking-wider">Mess Master</span>
        </div>
      </div>

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

      {/* Bottom status indicator */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="glass-panel rounded-xl p-3 text-xs bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse shadow-[0_0_8px_#22C55E]" />
            <span className="text-gray-400 font-medium">Service Online</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
