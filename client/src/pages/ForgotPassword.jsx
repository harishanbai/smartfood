import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Calendar, 
  HeartHandshake, 
  Globe, 
  Clock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { sendPasswordReset } = useAuth();
  const { language, setLanguage } = useLanguage();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    setError('');

    const res = await sendPasswordReset(email.trim());
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden font-sans relative">
      
      {/* LEFT PANEL: Branding & Feature Highlights */}
      <div className="w-full md:w-[55%] bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-8 sm:p-12 md:pr-16 text-white flex flex-col justify-between relative overflow-visible">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <ChefHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white">Smart Lunch Generator</h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Automated Daily Menus</span>
          </div>
        </div>

        {/* Center Slogan & Features */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Plan Smarter. <br />
              <span className="text-emerald-400">Serve Better.</span>
            </h2>
            <p className="text-emerald-300 font-semibold text-base sm:text-lg">
              Every Lunch, Perfect!
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <span>Auto Generate Menu</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <span>Veg &amp; Non-Veg Rules</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <span>Tamil &amp; English Support</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-emerald-100/90">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <span>Saves Time &amp; Effort</span>
            </div>
          </div>
        </div>

        {/* Meal Display Image */}
        <div className="relative z-10 mt-4 flex justify-center items-center">
          <div className="relative group w-full max-w-sm">
            <img 
              src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80" 
              alt="Indian Thali Meal" 
              className="w-full h-48 sm:h-56 object-cover rounded-3xl shadow-2xl border-2 border-emerald-500/30 group-hover:scale-[1.02] transition-all duration-500"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-400/30 inline-block">
                🌿 Fresh &amp; Balanced Daily Meals
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ANIMATED FLOWING CURVE DIVIDER */}
      <div className="hidden md:block absolute top-0 bottom-0 left-[55%] w-[80px] z-30 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        <motion.svg
          viewBox="0 0 80 900"
          preserveAspectRatio="none"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          animate={{ y: [0, -12, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="fpWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M 80 0 C 30 120, 10 200, 35 320 C 60 440, 5 520, 25 640 C 45 760, 15 840, 80 900 L 80 0 Z" fill="white" />
          <path d="M 0 0 C 50 120, 70 200, 45 320 C 20 440, 75 520, 55 640 C 35 760, 65 840, 0 900 L 0 0 Z" fill="url(#fpWaveFill)" />
        </motion.svg>
      </div>

      {/* MOBILE HORIZONTAL WAVE */}
      <div className="md:hidden relative -mt-3 w-full h-10 z-30 pointer-events-none">
        <motion.svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-full"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z" fill="white" />
        </motion.svg>
      </div>

      {/* RIGHT PANEL: Clean White Authentication Section */}
      <div className="w-full md:w-[45%] bg-white p-6 sm:p-10 md:p-12 flex items-center justify-center relative min-h-screen md:min-h-0">
        
        {/* Main Form Area */}
        <div className="max-w-md w-full my-auto space-y-5 text-center">
          
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reset Password 🔐
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Enter your registered email to receive a secure reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="text-base font-bold text-slate-900">Reset Link Sent!</h3>
              
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left">
                A password reset link has been sent to <strong className="text-emerald-700">{email}</strong>. Please check your inbox and follow the instructions in the email.
              </p>

              <Link
                to="/login"
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;
