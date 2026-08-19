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

  const addNotification = (text, type = 'info', options = {}) => {
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

    // Auto-remove after 4 seconds (unless persist is true, or duration is customized)
    if (!options.persist) {
      const duration = options.duration !== undefined ? options.duration : 4000;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
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
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel border shadow-2xl backdrop-blur-md animate-toast-in bg-white/95 dark:bg-[#0E3C2B]/95 text-slate-900 dark:text-white ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-50/95 dark:bg-emerald-950/80'
                : toast.type === 'warning'
                ? 'border-amber-500/30 bg-amber-50/95 dark:bg-amber-950/80'
                : 'border-blue-500/30 bg-blue-50/95 dark:bg-slate-900/90'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">✓</span>
              ) : toast.type === 'warning' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">!</span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold">i</span>
              )}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed pr-2 text-slate-800 dark:text-gray-100">
              {toast.text}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/5 cursor-pointer flex-shrink-0"
              aria-label="Dismiss notification"
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
