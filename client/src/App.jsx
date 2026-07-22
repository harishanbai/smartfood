import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TopSection from './components/TopSection';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import History from './pages/History';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-emerald-400">Loading Smart Lunch...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main Layout Wrapper
const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-bgMain text-gray-200 antialiased font-sans overflow-x-hidden w-full">
      {/* Floating premium sidebar */}
      <Sidebar />
      
      {/* Floating mobile bottom navigation */}
      <BottomNav />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-72 p-4 sm:p-6 md:p-8 pb-24 lg:pb-8 transition-all duration-300 w-full overflow-x-hidden">
        {/* Top digital date/clock, and greet bar */}
        <TopSection />

        {/* Sub-page router */}
        <div className="mt-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/foods" element={<Foods />} />
            <Route path="/history" element={<History />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
