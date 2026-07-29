import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Check if user has previously dismissed this session
      const dismissed = sessionStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed or running as standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsVisible(false);
    }

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed successfully');
      setDeferredPrompt(null);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // We no longer need the prompt, clear it
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 lg:bottom-6 lg:right-6 lg:left-auto lg:w-96 glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 bg-slate-900/90 text-white backdrop-blur-md">
      <div className="flex gap-4">
        {/* Decorative Icon */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
          <Download className="h-6 w-6 text-white animate-bounce" />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Install App
            </span>
          </div>
          <h3 className="font-bold text-sm text-white mt-0.5 tracking-tight">Vaseegrah Veda Catering</h3>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            Install our app on your device for instant offline access and a premium full-screen experience.
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 px-4 rounded-xl border border-white/15 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          Later
        </button>
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          Install Now
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
