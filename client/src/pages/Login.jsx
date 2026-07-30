import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  X,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp Auth Modal State
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');
  const [whatsappSuccess, setWhatsappSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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

    const res = await loginWithGoogle();

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

  const openWhatsappModal = () => {
    setIsWhatsappModalOpen(true);
    setOtpStep('phone');
    setPhoneInput('');
    setOtpCode('');
    setWhatsappError('');
    setWhatsappSuccess('');
  };

  const closeWhatsappModal = () => {
    setIsWhatsappModalOpen(false);
    setWhatsappError('');
    setWhatsappSuccess('');
    setWhatsappLoading(false);
  };

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
        closeWhatsappModal();
        navigate('/');
      }, 800);
    } else {
      setWhatsappError(res.error || 'OTP verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden font-sans">

      {/* LEFT PANEL: Branding & Feature Highlights */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
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

      {/* RIGHT PANEL: Clean White Authentication Section */}
      <div className="w-full md:w-1/2 bg-white p-6 sm:p-10 md:p-12 flex flex-col justify-between relative min-h-screen md:min-h-0">

        {/* Language Selector Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
          >
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>{language === 'en' ? 'English' : 'தமிழ்'}</span>
            <span className="text-[10px] text-slate-400 font-mono">▼</span>
          </button>
        </div>

        {/* Main Form Area */}
        <div className="max-w-md w-full mx-auto my-auto space-y-5 text-center">

          {/* Welcome Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Welcome 👋
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Login to manage your smart lunch menus
            </p>
          </div>

          {/* Graphic Illustration */}
          <div className="py-1 flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-inner relative">
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2">
                <CheckSquare className="h-7 w-7 text-emerald-600" />
                <span className="text-xl">🍲</span>
              </div>
            </div>
          </div>

          {/* Login Tab Header */}
          <div className="flex flex-col items-center justify-center pb-2">
            <span className="text-emerald-700 font-bold text-sm tracking-wide uppercase">
              Secure Login
            </span>
            <div className="w-14 h-1 bg-emerald-600 rounded-full mt-1 shadow-sm" />
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
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
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[46px]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

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
            {/* Google SSO Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading || whatsappLoading}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              {googleLoading ? (
                <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
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
                </>
              )}
            </button>

            {/* WhatsApp Login Button (Positioned Below Google Sign-In) */}
            <button
              type="button"
              onClick={openWhatsappModal}
              disabled={loading || googleLoading || whatsappLoading}
              className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#20bd5a] border-2 border-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              {/* WhatsApp SVG Icon */}
              <svg className="w-5 h-5 flex-shrink-0 fill-current text-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Continue with WhatsApp</span>
            </button>
          </div>

          {/* Link to Sign Up */}
          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
              Create Account
            </Link>
          </p>

        </div>

        {/* BOTTOM SECURITY CARD */}
        <div className="mt-6 pt-4">
          <div className="max-w-md mx-auto bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                Secure • Simple • Always Free
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                Your data is safe with us.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── WHATSAPP AUTH MODAL DIALOG ────────────────────────────────────── */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all duration-300">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white relative">
              <button
                type="button"
                onClick={closeWhatsappModal}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg">
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Continue with WhatsApp</h3>
                  <p className="text-xs text-emerald-200 font-medium">Instant OTP verification via WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">

              {/* Error Alert */}
              {whatsappError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{whatsappError}</span>
                </div>
              )}

              {/* Success Alert */}
              {whatsappSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>{whatsappSuccess}</span>
                </div>
              )}

              {/* STEP 1: Enter Phone Number */}
              {otpStep === 'phone' && (
                <form onSubmit={handleSendWhatsappOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold focus:outline-none focus:border-emerald-500"
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
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="98765 43210"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                      We will send a 6-digit verification code to your WhatsApp account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={whatsappLoading}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {whatsappLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        <span>Send OTP via WhatsApp</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP Code */}
              {otpStep === 'otp' && (
                <form onSubmit={handleVerifyWhatsappOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setOtpCode('');
                          setWhatsappError('');
                        }}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
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
                      className="w-full text-center py-3 text-2xl font-black tracking-widest rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500"
                    />

                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium text-center">
                      Code sent to <span className="font-bold text-slate-800">{countryCode} {phoneInput}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={whatsappLoading || otpCode.length !== 6}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {whatsappLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
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

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
