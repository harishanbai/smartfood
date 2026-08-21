import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
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
import { useNotifications } from '../context/NotificationContext';
import { authApi } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { sendPasswordReset } = useAuth();
  const { language, setLanguage } = useLanguage();
  const notificationContext = useNotifications();
  const addNotification = notificationContext?.addNotification;

  // Alias for compatibility
  const setIsLoading = setLoading;

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

    setIsLoading(true);
    setError('');

    try {
      const res = await sendPasswordReset(email.trim());
      if (res?.success) {
        setSubmitted(true);
        if (addNotification) {
          addNotification(res.message || 'Password reset email sent successfully!', 'success');
        }
      } else {
        const errorMsg = res?.error || 'Unable to send reset email. Please try again later.';
        setError(errorMsg);
        if (addNotification) {
          addNotification(errorMsg, 'error');
        }
      }
    } catch (err) {
      console.error('[ForgotPassword] Form Submit Error:', err);
      const catchMsg = err?.message || 'An unexpected error occurred. Please try again.';
      setError(catchMsg);
      if (addNotification) {
        addNotification(catchMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden font-sans relative">

      {/* LEFT PANEL: Modern Dark Emerald Green Branding & Feature Highlights Sidebar */}
      <div
        className="hidden md:flex w-full md:w-[55%] p-8 sm:p-10 lg:p-12 text-white flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #062c22 0%, #041f18 55%, #02130e 100%)'
        }}
      >
        {/* Animated Background Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP SECTION: App Header at the top left */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#0a2318] border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-950/50 backdrop-blur-sm overflow-hidden">
            <img src={logoImg} alt="Smart Lunch Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white leading-none">Smart Lunch Generator</h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mt-1">AUTOMATED DAILY MENUS</span>
          </div>
        </div>

        {/* 2. UPPER-MIDDLE SECTION (Shifted Up): Food Showcase Image Card */}
        <div className="relative z-10 my-2 lg:my-4 flex justify-center items-center">
          <div className="relative group w-full max-w-sm">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl pointer-events-none" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-emerald-950/40">
              <img
                src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80"
                alt="Delicious food showcase"
                className="w-full h-36 md:h-40 lg:h-48 xl:h-52 object-cover rounded-3xl group-hover:scale-[1.03] transition-all duration-500"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center pointer-events-none">
                <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-slate-950/80 backdrop-blur-md px-3 py-1 lg:px-3.5 lg:py-1.5 rounded-full border border-emerald-500/30 inline-block shadow-lg">
                  🔥 FRESH & BALANCED DAILY MEALS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LOWER-MIDDLE SECTION (Shifted Down): Centered Bold Hero Title & Subtitle */}
        <div className="relative z-10 my-1 lg:my-2 text-center space-y-1">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Plan Smarter. <br />
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Serve Better.
            </span>
          </h2>
          <p className="text-emerald-300 font-semibold text-xs md:text-sm lg:text-base xl:text-lg">
            Every Lunch, Perfect!
          </p>
        </div>

        {/* 4. BOTTOM SECTION: 2x2 Grid of Feature Cards (Matching Image 1) */}
        <div className="relative z-10 grid grid-cols-2 gap-2 lg:gap-3 pt-1">
          {[
            {
              icon: Calendar,
              title: "Auto Generate Menu",
              desc: "Instantly create weekly lunch plans"
            },
            {
              icon: HeartHandshake,
              title: "Veg & Non-Veg Rules",
              desc: "Custom configurations per day"
            },
            {
              icon: Globe,
              title: "Tamil & English Support",
              desc: "Full bilingual interface accessibility"
            },
            {
              icon: Clock,
              title: "Saves Time & Effort",
              desc: "Automate kitchen administrative tasks"
            }
          ].map((feat, index) => (
            <div
              key={index}
              className="p-2.5 lg:p-3 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center gap-2.5 lg:gap-3 transition-all duration-300 backdrop-blur-md hover:bg-white/[0.07] hover:border-emerald-500/30"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-sm">
                <feat.icon className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] lg:text-xs xl:text-sm font-bold text-white leading-snug truncate lg:whitespace-normal">{feat.title}</h4>
                <p className="text-[9px] lg:text-[10px] xl:text-[11px] text-slate-300/80 font-normal mt-0.5 leading-snug line-clamp-2">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. BACKGROUND: Clean decorative white wave curves along the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 pointer-events-none overflow-hidden z-0 opacity-15">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
              fill="#ffffff"
            />
            <path
              d="M0,30 C200,100 450,10 700,70 C950,130 1100,50 1200,80 L1200,120 L0,120 Z"
              fill="#ffffff"
              fillOpacity="0.5"
            />
          </svg>
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

      {/* RIGHT PANEL: Clean White Authentication Section */}
      <div className="w-full md:w-[45%] bg-white p-6 sm:p-10 md:p-12 flex items-center justify-center relative min-h-screen md:min-h-0">

        {/* Main Form Area */}
        <div className="max-w-md w-full my-auto space-y-5 text-center">

          {/* Logo & Branding - Visible ONLY on mobile view since left panel is hidden */}
          <div className="flex flex-col items-center gap-2 mb-2 md:hidden">
            <div className="h-12 w-12 rounded-2xl bg-[#0a2318] border border-emerald-500/20 flex items-center justify-center shadow-sm overflow-hidden">
              <img src={logoImg} alt="Smart Lunch Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="text-center">
              <h1 className="font-extrabold text-lg text-slate-900 leading-none">
                Smart Lunch
              </h1>
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mt-1">
                AUTOMATED DAILY MENUS
              </span>
            </div>
          </div>

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
