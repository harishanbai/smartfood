import React, { useState } from 'react';
import { ChefHat, Database, AlertTriangle, ShieldCheck, RefreshCw, Globe } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();
  const { language, setLanguage, t } = useLanguage();

  const languagesList = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  // Function to seed database with premium recipes
  const handleSeedDatabase = async () => {
    if (!window.confirm(t('settings.seedConfirm'))) return;
    setLoading(true);
    try {
      const seedDishes = [
        {
          name: "Butter Chicken with Garlic Naan",
          category: "Main Course",
          description: "Tender chicken cooked in a rich, creamy, spiced tomato butter gravy, served alongside fresh tandoori garlic naan.",
          image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Crispy Grilled Salmon",
          category: "Main Course",
          description: "Pan-seared Atlantic salmon fillet with crispy skin, drizzled in lemon-herb butter sauce and served with roasted asparagus.",
          image: "https://images.unsplash.com/photo-1485921325814-a50433396582?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Premium Veg Hakka Noodles",
          category: "Main Course",
          description: "Stir-fried wheat noodles tossed with crisp colorful bell peppers, cabbage, carrots, scallions, and signature soy-sesame glaze.",
          image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Caesar Salad with Crispy Bacon",
          category: "Salad",
          description: "Fresh romaine lettuce tossed with creamy Caesar dressing, garlic croutons, crispy smoked bacon pieces, and shaved parmesan.",
          image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Classic Italian Tiramisu",
          category: "Dessert",
          description: "Delicate espresso-dipped ladyfinger biscuits layered with a whipped mixture of egg yolks, sugar, mascarpone, and cocoa powder.",
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Double Chocolate Lava Cake",
          category: "Dessert",
          description: "Warm chocolate sponge cake with a liquid chocolate core, served with a scoop of premium Madagascan vanilla ice cream.",
          image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Classic Garlic Butter Garlic Bread",
          category: "Starter",
          description: "Toasted baguette slices smothered in garlic, fresh parsley, and melted unsalted butter, topped with bubbling mozzarella.",
          image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Spiced Mango Smoothie",
          category: "Beverage",
          description: "Creamy blend of ripe Alphonso mangoes, Greek yogurt, honey, and a pinch of ground cardamom, served chilled.",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Creamy Roasted Tomato Soup",
          category: "Soup",
          description: "Vibrant soup prepared with vine-roasted tomatoes, garlic, extra virgin olive oil, fresh basil leaves, and a dash of double cream.",
          image: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=800&q=80",
          available: true
        },
        {
          name: "Signature Spicy Chicken Wings",
          category: "Starter",
          description: "Deep-fried chicken wings glazed in a spicy honey sriracha marinade, served with creamy blue cheese dip.",
          image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
          available: true
        }
      ];

      for (const dish of seedDishes) {
        await api.post('/foods', dish, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      addNotification(t('settings.seedSuccess'), "success");
    } catch (err) {
      console.error(err);
      addNotification(t('settings.seedFailed'), "warning");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Database Management Card */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-accentPurple" />
            {t('settings.dbSetup')}
          </h3>
          <p className="text-xs text-gray-400 mb-6">{t('settings.dbSetupSub')}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-semibold text-white">{t('settings.preseedTitle')}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                {t('settings.preseedSub')}
              </p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? t('settings.seeding') : t('settings.btnSeed')}
            </button>
          </div>
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
