import React from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-[min(22rem,calc(100vw-2rem))] glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-[rgba(34,197,94,0.45)] bg-[#0a2d1f]/95 text-white backdrop-blur-xl animate-fade-in">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(34,197,94,0.2)]">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accentGreen" />
          <h4 className="font-bold text-sm text-white">Notifications</h4>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close notifications"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-6 font-medium">No new notifications</p>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className="flex gap-3 p-3 rounded-xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              <div className="mt-0.5 flex-shrink-0">
                {notif.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-accentGreen" />
                ) : notif.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-accentOrange" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600 dark:text-accentPurple" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 dark:text-gray-100 font-semibold leading-relaxed break-words">{notif.text}</p>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 block font-medium">{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
