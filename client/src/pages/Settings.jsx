import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Globe, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();
  const { language, setLanguage, t } = useLanguage();

  const [chefName, setChefName] = useState(() => localStorage.getItem('chefName') || 'Chef');
  const [chefPhone, setChefPhone] = useState(() => localStorage.getItem('chefPhone') || '');



  const handleSaveChef = (e) => {
    e.preventDefault();
    localStorage.setItem('chefName', chefName);
    localStorage.setItem('chefPhone', chefPhone);
    addNotification(t('settings.chefConfigSaved'), 'success');
  };

  const languagesList = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];



  return (
    <div className="min-h-screen pb-12 w-full max-w-3xl mx-auto">
      <div className="space-y-8">
        
        {/* Language Selection Card */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentPurple/10 rounded-full blur-[80px] pointer-events-none" />
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Globe className="h-5 w-5 text-accentPurple" />
            {t('settings.langSelect')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.langSelectDesc')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-accentPurple/10 border-accentPurple/50 text-white shadow-lg shadow-purple-500/10 scale-103'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-2xl mb-2">{lang.flag}</span>
                <span className="text-sm font-semibold">{lang.name}</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1 uppercase">{lang.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chef Config Card */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accentPurple" />
            {t('settings.chefConfig')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.chefConfigSub')}</p>

          <form onSubmit={handleSaveChef} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.chefName')}</label>
                <input
                  type="text"
                  required
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  placeholder={t('settings.chefNamePlaceholder')}
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.chefPhone')}</label>
                <input
                  type="text"
                  value={chefPhone}
                  onChange={(e) => setChefPhone(e.target.value)}
                  placeholder={t('settings.chefPhonePlaceholder')}
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer min-h-[44px]"
              >
                {t('settings.btnSaveChef')}
              </button>
            </div>
          </form>
        </div>




        {/* Automated Scheduler Details */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accentGreen" />
            {t('settings.schedulerConfig')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.schedulerSub')}</p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">{t('settings.cronStatus')}</span>
              <span className="text-accentGreen font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse" />
                {t('settings.cronActive')}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">{t('settings.triggerFreq')}</span>
              <span className="text-white font-mono font-medium">{t('settings.triggerTime')}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">{t('settings.targetAction')}</span>
              <span className="text-white font-medium">{t('settings.targetActionDesc')}</span>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="glass-panel rounded-[24px] p-6 border border-accentOrange/20 bg-accentOrange/5 relative overflow-hidden">
          <h3 className="text-lg font-bold text-accentOrange mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t('settings.dangerousSettings')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.dangerousSub')}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-semibold text-white">{t('settings.resetDb')}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                {t('settings.resetDbSub')}
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm(t('settings.resetConfirm'))) {
                  try {
                    addNotification(t('settings.resetInitiated'), "info");
                  } catch (e) {
                    addNotification(t('settings.resetFailed'), "warning");
                  }
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {t('settings.btnReset')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
