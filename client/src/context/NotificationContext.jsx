import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System Initialized: Mess Master Dashboard Active", time: "Just now", type: "info" },
    { id: 2, text: "Auto Generation Status set to Active (08:00 PM)", time: "10 mins ago", type: "success" },
    { id: 3, text: "Database connection successful", time: "30 mins ago", type: "info" }
  ]);

  const addNotification = (text, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      text,
      time: 'Just now',
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
