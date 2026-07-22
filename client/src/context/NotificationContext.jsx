import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System Initialized: Mess Master Dashboard Active", time: "Just now", type: "info" },
    { id: 2, text: "Auto Generation Status set to Active (08:00 PM)", time: "10 mins ago", type: "success" },
    { id: 3, text: "Database connection successful", time: "30 mins ago", type: "info" }
  ]);

  const [toasts, setToasts] = useState([]);

  const addNotification = (text, type = 'info') => {
    const id = Date.now();
    // Add to historical notifications dropdown list
    const newNotif = {
      id,
      text,
      time: 'Just now',
      type
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Add to active visual floating toasts
    const newToast = { id, text, type };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
      
      {/* Zero-dependency CSS keyframe for premium slide-in animation */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-toast-in {
          animation: toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-[min(24rem,calc(100vw-3rem))] w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel border shadow-2xl backdrop-blur-md animate-toast-in ${
              toast.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-white'
                : toast.type === 'warning'
                ? 'border-orange-500/20 bg-orange-500/10 text-white'
                : 'border-purple-500/20 bg-purple-500/10 text-white'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">✓</span>
              ) : toast.type === 'warning' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">!</span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">i</span>
              )}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed pr-2">
              {toast.text}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer flex-shrink-0"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
