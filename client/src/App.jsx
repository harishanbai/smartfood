import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TopSection from './components/TopSection';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';

import PWAInstallPrompt from './components/PWAInstallPrompt';
import SplashScreen from './components/SplashScreen';

// Lazy load secondary sub-pages for optimal code splitting & fast initial loading
const Ingredients = lazy(() => import('./pages/Ingredients'));
const Foods = lazy(() => import('./pages/Foods'));
const History = lazy(() => import('./pages/History'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Payment = lazy(() => import('./pages/Payment'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Page loading fallback
const PageLoader = () => (
  <div className="w-full py-16 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-xs font-semibold tracking-wider text-emerald-400/80">Loading...</span>
    </div>
  </div>
);

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
  const [isCollapsed, setIsCollapsed] = React.useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const location = useLocation();

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebarCollapsed', String(newVal));
      return newVal;
    });
  }, []);

  const isDashboard = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-bgMain text-gray-200 antialiased font-sans overflow-x-hidden w-full">
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        
        {/* Floating mobile bottom navigation */}
        <BottomNav />

        {isDashboard && <PWAInstallPrompt />}

        {/* Main Content Area */}
        <main className={`flex-1 ml-0 ${isCollapsed ? 'lg:ml-24' : 'lg:ml-72'} p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[margin-left] w-full overflow-x-hidden`}>
          {/* Top digital date/clock, and greet bar */}
          <TopSection />

          {/* Sub-page router */}
          <div className="mt-0 sm:mt-2">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ingredients" element={<Ingredients />} />
                <Route path="/foods" element={<Foods />} />
                <Route path="/history" element={<History />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment" element={<Payment />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={currentUser ? <Navigate to="/" replace /> : <SignUp />} 
        />
        <Route 
          path="/forgot-password" 
          element={currentUser ? <Navigate to="/" replace /> : <ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
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
    </Suspense>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <ConfirmProvider>
              <SplashScreen />
              <Router>
                <AppRoutes />
              </Router>
            </ConfirmProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
