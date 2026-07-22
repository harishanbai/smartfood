import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ShieldCheck, ChefHat, Calendar, HeartHandshake, Clock, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.error || 'Google Authentication failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900 font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* LEFT PANEL: Dark Green Promotional & Branding Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#062415] via-[#0A331E] to-[#041A0E] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        
        {/* Decorative Background Leaves Pattern / Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Branding */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            {/* Chef Hat Logo */}
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-400 shadow-lg">
              <ChefHat className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase text-white">
                SMART <span className="text-emerald-400">LUNCH</span>
              </h1>
              <div className="text-[10px] tracking-[0.3em] font-semibold text-emerald-300/80 uppercase">
                G E N E R A T O R
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="pt-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
              Plan Smarter. Serve Better.
            </h2>
            <p className="text-emerald-400 font-semibold text-lg md:text-xl">
              Every Lunch, Perfect!
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Calendar className="h-4 w-4" />
              </div>
              <span>Auto Generate Menu</span>
            </div>

            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <span>Veg & Non-Veg Rules</span>
            </div>

            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Globe className="h-4 w-4" />
              </div>
              <span>Tamil & English Support</span>
            </div>

            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Clock className="h-4 w-4" />
              </div>
              <span>Saves Time & Effort</span>
            </div>
          </div>
        </div>

        {/* Large South Indian Thali / Meal Display */}
        <div className="relative z-10 mt-8 flex justify-center items-center">
          <div className="relative group w-full max-w-sm sm:max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80" 
              alt="Indian Thali Meal" 
              className="w-full h-56 sm:h-64 object-cover rounded-3xl shadow-2xl border-2 border-emerald-500/30 group-hover:scale-[1.02] transition-all duration-500"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/30">
                🌿 Fresh & Balanced Daily Meals
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Clean White Authentication Section */}
      <div className="w-full md:w-1/2 bg-white p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-between relative">
        
        {/* Language Selector Top Right */}
        <div className="flex justify-end mb-6">
          <div className="relative inline-block">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>{language === 'en' ? 'English' : 'தமிழ்'}</span>
              <span className="text-[10px] text-slate-400 font-mono">▼</span>
            </button>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6 text-center">
          
          {/* Welcome Heading */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Welcome 👋
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Login to manage your smart lunch menus
            </p>
          </div>

          {/* Food / Clipboard Graphic Illustration */}
          <div className="py-2 flex justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-inner relative">
              {/* Green Clipboard with Food Bowl */}
              <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2">
                <CheckSquare className="h-8 w-8 text-emerald-600" />
                <span className="text-2xl">🍲</span>
              </div>
            </div>
          </div>

          {/* Login Section Tab with Green Underline */}
          <div className="flex flex-col items-center justify-center pt-1 pb-4">
            <span className="text-emerald-700 font-bold text-base tracking-wide uppercase">
              Login
            </span>
            <div className="w-16 h-1 bg-emerald-600 rounded-full mt-1.5 shadow-sm" />
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl animate-fade-in text-left">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* AUTHENTICATION: Single "Continue with Google" Button */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-base rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-4 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {/* Official Google "G" SVG Logo */}
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>
          </div>

        </div>

        {/* BOTTOM SECURITY SECTION */}
        <div className="mt-8 pt-4">
          <div className="max-w-md mx-auto bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Secure • Simple • Always Free
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                Your data is safe with us.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
