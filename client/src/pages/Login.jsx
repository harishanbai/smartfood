import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Calendar,
  HeartHandshake,
  Globe,
  Clock,
  CheckSquare,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Phone,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';



const DISH_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80",
    label: "🌿 Fresh & Balanced Daily Meals"
  },
  {
    url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    label: "🍛 Traditional South Indian Delicacies"
  },
  {
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    label: "✨ Premium Biryani & Feasts"
  }
];

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'whatsapp' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp Auth State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');
  const [whatsappSuccess, setWhatsappSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [currentDishIndex, setCurrentDishIndex] = useState(0);

  // Carousel timer for dishes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDishIndex((prev) => (prev + 1) % DISH_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const {
    loginWithEmailPassword,
    loginWithGoogle,
    requestWhatsappOtp,
    verifyWhatsappOtp
  } = useAuth();
  const { addNotification } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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
    if (!password) {
      setError('Password is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    setError('');

    const res = await loginWithEmailPassword(email.trim(), password);
    setLoading(false);

    if (res.success) {
      addNotification('Login Successful! Welcome back 🎉', 'success');
      navigate('/');
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError('');

    const res = await loginWithGoogle(email);

    if (res.success) {
      if (res.redirecting) {
        // App is redirecting to Google, don't show success banner or navigate yet
        return;
      }
      setGoogleLoading(false);
      addNotification('Google Sign-In Successful! Welcome 🎉', 'success');
      navigate('/');
    } else {
      setGoogleLoading(false);
      setError(res.error || 'Google Sign-In failed.');
    }
  };

  // ── WhatsApp Auth Handlers ─────────────────────────────────────────

  const handleSendWhatsappOtp = async (e) => {
    if (e) e.preventDefault();

    const rawPhone = phoneInput.trim().replace(/\D/g, '');
    if (!rawPhone || rawPhone.length < 7) {
      setWhatsappError('Please enter a valid mobile number.');
      return;
    }

    const fullPhone = `${countryCode}${rawPhone}`;
    setWhatsappLoading(true);
    setWhatsappError('');
    setWhatsappSuccess('');

    const res = await requestWhatsappOtp(fullPhone);
    setWhatsappLoading(false);

    if (res.success) {
      setOtpStep('otp');
      setResendTimer(30); // 30s resend cooldown
      setWhatsappSuccess(res.message || `OTP sent to ${fullPhone} via WhatsApp.`);
    } else {
      setWhatsappError(res.error || 'Failed to send OTP to your WhatsApp number.');
    }
  };

  const handleVerifyWhatsappOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setWhatsappError('Please enter a valid 6-digit OTP code.');
      return;
    }

    const fullPhone = `${countryCode}${phoneInput.trim().replace(/\D/g, '')}`;
    setWhatsappLoading(true);
    setWhatsappError('');
    setWhatsappSuccess('');

    const res = await verifyWhatsappOtp(fullPhone, cleanOtp);
    setWhatsappLoading(false);

    if (res.success) {
      setWhatsappSuccess('WhatsApp Authentication Successful! Redirecting...');
      addNotification('WhatsApp Sign-In Successful! Welcome 🎉', 'success');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setWhatsappError(res.error || 'OTP verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 overflow-x-hidden font-sans relative">

      {/* LEFT PANEL: Branding & Feature Highlights */}
      <div className="hidden md:flex w-full md:w-[50%] lg:w-[55%] bg-gradient-to-br from-emerald-900 via-slate-950 to-teal-950 p-8 sm:p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Animated Glow Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 -mt-12 -mr-12 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 -mb-12 -ml-12 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Top Branding Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-950/50 backdrop-blur-sm"
          >
            <ChefHat className="h-7 w-7" />
          </motion.div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white leading-none">
              Vaseegrah Veda
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mt-1">
              Catering • Smart Lunch
            </span>
          </div>
        </div>

        {/* Center Slogan & Features */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white"
            >
              Plan Smarter. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Serve Better.
              </span>
            </motion.h2>
            <p className="text-emerald-300/80 font-semibold text-base sm:text-lg">
              Every Lunch, Perfect!
            </p>
          </div>

          {/* Feature Highlights - redesigned as micro-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { icon: Calendar, label: "Auto Generate Menu", desc: "Instantly create weekly lunch plans" },
              { icon: HeartHandshake, label: "Veg & Non-Veg Rules", desc: "Custom configurations per day" },
              { icon: Globe, label: "Tamil & English Support", desc: "Full bilingual interface accessibility" },
              { icon: Clock, label: "Saves Time & Effort", desc: "Automate kitchen administrative tasks" }
            ].map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(16, 185, 129, 0.25)" }}
                className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex gap-3 transition-all duration-300 backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
                  <feat.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{feat.label}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Meal Display Image Carousel */}
        <div className="relative z-10 mt-4 flex justify-center items-center h-48 sm:h-56">
          <div className="relative w-full max-w-sm h-full flex justify-center items-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl pointer-events-none" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDishIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full relative"
              >
                <img
                  src={DISH_IMAGES[currentDishIndex].url}
                  alt="Vaseegrah Catering Dishes"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85 pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 inline-block shadow-lg">
                    {DISH_IMAGES[currentDishIndex].label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ANIMATED FLOWING CURVE DIVIDER */}
      <div className="hidden md:block absolute top-0 bottom-0 left-[50%] lg:left-[55%] w-[80px] z-30 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
        <motion.svg
          viewBox="0 0 80 900"
          preserveAspectRatio="none"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          animate={{ y: [0, -10, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="suWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d="M 80 0 C 30 120, 10 200, 35 320 C 60 440, 5 520, 25 640 C 45 760, 15 840, 80 900 L 80 0 Z" fill="white" />
          <path d="M 0 0 C 50 120, 70 200, 45 320 C 20 440, 75 520, 55 640 C 35 760, 65 840, 0 900 L 0 0 Z" fill="url(#suWaveFill)" />
        </motion.svg>
      </div>



      {/* RIGHT PANEL: Clean White Authentication Section */}
      <div className="w-full md:w-[50%] lg:w-[45%] bg-white p-6 sm:p-10 md:p-12 flex flex-col justify-between relative min-h-screen md:min-h-0">

        {/* Main Form Area */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6 text-center relative z-10">

          {/* Logo & Branding - Visible ONLY on mobile view since left panel is hidden */}
          <div className="flex flex-col items-center gap-2 mb-2 md:hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <ChefHat className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h1 className="font-extrabold text-lg text-slate-900 leading-none">
                Vaseegrah Veda
              </h1>
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mt-1">
                Catering • Smart Lunch
              </span>
            </div>
          </div>

          {/* Welcome Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Welcome 👋
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              {loginMethod === 'whatsapp'
                ? 'Sign in instantly with your WhatsApp number'
                : 'Login to manage your smart catering lunch menus'}
            </p>
          </div>

          {/* Animated Tab Forms Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loginMethod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[260px]"
            >
              {/* TAB 1: WhatsApp Sign In Form */}
              {loginMethod === 'whatsapp' && (
                <div className="space-y-4">
                  {/* WhatsApp Error Alert */}
                  {whatsappError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{whatsappError}</span>
                    </div>
                  )}

                  {/* WhatsApp Success Alert */}
                  {whatsappSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{whatsappSuccess}</span>
                    </div>
                  )}

                  {/* STEP 1: Enter Phone Number */}
                  {otpStep === 'phone' && (
                    <form onSubmit={handleSendWhatsappOtp} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 pl-0.5">
                          WhatsApp Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+65">🇸🇬 +65</option>
                            <option value="+60">🇲🇾 +60</option>
                            <option value="+61">🇦🇺 +61</option>
                          </select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                            <input
                              type="tel"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              placeholder="98765 43210"
                              required
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium pl-0.5">
                          We will send a 6-digit verification code to your WhatsApp account.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={whatsappLoading}
                        className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-600/15 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
                      >
                        {whatsappLoading ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="h-4.5 w-4.5" />
                            <span>Send OTP via WhatsApp</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('email');
                          setWhatsappError('');
                          setWhatsappSuccess('');
                        }}
                        className="w-full py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] mt-2"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Email Sign In</span>
                      </button>
                    </form>
                  )}

                  {/* STEP 2: Enter OTP Code */}
                  {otpStep === 'otp' && (
                    <form onSubmit={handleVerifyWhatsappOtp} className="space-y-4 text-left">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 pl-0.5">
                            Enter 6-Digit OTP
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep('phone');
                              setOtpCode('');
                              setWhatsappError('');
                            }}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            <span>Change Number</span>
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          autoFocus
                          required
                          className="w-full text-center py-3 text-2xl font-black tracking-widest rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />

                        <p className="text-[11px] text-slate-500 mt-1.5 font-medium text-center">
                          Code sent to <span className="font-bold text-slate-800">{countryCode} {phoneInput}</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={whatsappLoading || otpCode.length !== 6}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-600/15 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
                      >
                        {whatsappLoading ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="h-4.5 w-4.5" />
                            <span>Verify &amp; Sign In</span>
                          </>
                        )}
                      </button>

                      {/* Resend Timer */}
                      <div className="text-center pt-1">
                        {resendTimer > 0 ? (
                          <span className="text-xs text-slate-400 font-medium">
                            Resend code in <strong className="text-slate-600">{resendTimer}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendWhatsappOtp}
                            disabled={whatsappLoading}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Resend OTP via WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: Email/Password Sign In Form */}
              {loginMethod === 'email' && (
                <div className="space-y-4">
                  {/* Email Error Alert */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 pl-0.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 pl-0.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Remember Me</span>
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || googleLoading || whatsappLoading}
                      className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-650/15 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {loginMethod === 'email' && (
            <>
              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  OR
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* SSO Buttons Container */}
              <div className="space-y-2.5">
                {/* WhatsApp SSO Option */}
                <button
                  onClick={() => {
                    setLoginMethod('whatsapp');
                    setOtpStep('phone');
                    setError('');
                    setWhatsappError('');
                    setWhatsappSuccess('');
                  }}
                  disabled={loading || googleLoading || whatsappLoading}
                  className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <svg className="w-5 h-5 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.887-6.967a9.782 9.782 0 0 0-6.926-2.884c-5.447 0-9.873 4.421-9.878 9.855a9.8 9.8 0 0 0 1.5 5.053l-.988 3.597 3.69-.968z" />
                  </svg>
                  <span>Continue with WhatsApp</span>
                </button>

                {/* Google SSO Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading || whatsappLoading}
                  className="w-full py-3 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-slate-500 pt-2 font-medium">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-extrabold transition-colors">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Login;
