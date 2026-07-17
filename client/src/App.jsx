import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopSection from './components/TopSection';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import History from './pages/History';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex min-h-screen bg-bgMain text-gray-200 antialiased font-sans">
          
          {/* Floating premium sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 ml-72 p-8 transition-all duration-300">
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
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
