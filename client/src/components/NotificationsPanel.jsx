import React from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-16 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-white/10 animate-fade-in">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accentPurple" />
          <h4 className="font-semibold text-sm text-white">Notifications</h4>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className="flex gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="mt-0.5">
                {notif.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-accentGreen" />
                ) : notif.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-accentOrange" />
                ) : (
                  <Info className="h-4 w-4 text-accentPurple" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-200 leading-normal">{notif.text}</p>
                <span className="text-[10px] text-gray-500 mt-1 block">{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
