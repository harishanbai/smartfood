import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Globe, MessageSquare, CreditCard } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmContext';

const Settings = () => {
  const { addNotification } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const confirm = useConfirm();

  const [chefName, setChefName] = useState(() => {
    const lang = localStorage.getItem('language') || 'en';
    return localStorage.getItem(`chefName_${lang}`) || localStorage.getItem('chefName') || (lang === 'ta' ? 'மாஸ்டர்' : 'Chef');
  });
  const [chefPhone, setChefPhone] = useState(() => localStorage.getItem('chefPhone') || '');

  const [upiId, setUpiId] = useState(() => localStorage.getItem('payment_upiId') || 'harishanbai06-2@oksbi');
  const [upiName, setUpiName] = useState(() => localStorage.getItem('payment_upiName') || 'Vaseegrah Veda Catering');
  const [upiAmount, setUpiAmount] = useState(() => localStorage.getItem('payment_upiAmount') || '120');
  const [bankName, setBankName] = useState(() => localStorage.getItem('payment_bankName') || 'State Bank of India');
  const [bankAcc, setBankAcc] = useState(() => localStorage.getItem('payment_bankAcc') || '43868513959');
  const [bankIfsc, setBankIfsc] = useState(() => localStorage.getItem('payment_bankIfsc') || '92038944816');

  useEffect(() => {
    const lang = language || 'en';
    const stored = localStorage.getItem(`chefName_${lang}`) || localStorage.getItem('chefName');
    if (stored) {
      setChefName(stored);
    } else {
      setChefName(lang === 'ta' ? 'மாஸ்டர்' : 'Chef');
    }
  }, [language]);

  const handleSaveChef = (e) => {
    e.preventDefault();
    const lang = language || 'en';
    localStorage.setItem(`chefName_${lang}`, chefName);
    localStorage.setItem('chefName', chefName);
    localStorage.setItem('chefPhone', chefPhone);
    window.dispatchEvent(new Event('profile-change'));
    addNotification(t('settings.chefConfigSaved'), 'success');
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    localStorage.setItem('payment_upiId', upiId.trim());
    localStorage.setItem('payment_upiName', upiName.trim());
    localStorage.setItem('payment_upiAmount', upiAmount.trim());
    localStorage.setItem('payment_bankName', bankName.trim());
    localStorage.setItem('payment_bankAcc', bankAcc.trim());
    localStorage.setItem('payment_bankIfsc', bankIfsc.trim());
    window.dispatchEvent(new Event('payment-config-change'));
    addNotification(t('settings.paymentConfigSaved'), 'success');
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
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${language === lang.code
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

        {/* Payment Config Card */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accentPurple" />
            {t('settings.paymentConfig')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.paymentConfigSub')}</p>

          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.upiId')}</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. harishanbai06-2@oksbi"
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.upiName')}</label>
                <input
                  type="text"
                  required
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  placeholder="e.g. Vaseegrah Veda Catering"
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.upiAmount')}</label>
                <input
                  type="number"
                  required
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  placeholder="120"
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.bankName')}</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard"
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="Indian Bank">Indian Bank</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.bankAcc')}</label>
                <input
                  type="text"
                  required
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  placeholder="e.g. 43868513959"
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('settings.bankIfsc')}</label>
                <input
                  type="text"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  placeholder="e.g. 92038944816"
                  className="w-full glass-panel px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accentPurple/50 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-glowGold hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center gap-2 border border-gold-400/30"
                style={{ backgroundColor: '#D4AF37', color: '#000000', fontWeight: 800 }}
              >
                {t('settings.btnSavePayment')}
              </button>
            </div>
          </form>
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
                const isConfirmed = await confirm({
                  title: t('settings.resetDb'),
                  message: t('settings.resetConfirm'),
                  confirmText: t('settings.btnReset'),
                  cancelText: t('common.cancel'),
                  type: 'warning'
                });
                if (isConfirmed) {
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
