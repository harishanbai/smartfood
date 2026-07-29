import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Calendar,
  HeartHandshake,
  Globe,
  Clock,
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
  ArrowLeft,
  ShieldCheck,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import FoodCarousel from '../components/FoodCarousel';

/* ─── Premium Color Tokens (Deep Charcoal/Dark Green & Warm Orange/Amber) ─── */
const C = {
  orangePrimary: '#f97316',
  orangeLight:   '#fb923c',
  amberGlow:     '#f59e0b',
  orangeDeep:    '#ea580c',
  darkBg:        '#08120d', // Deep charcoal with dark green undertone
  darkMid:       '#0d1d16',
  darkSoft:      '#13261d',
  cream:         '#ffffff',
  creamOff:      '#fcfdfd',
  textDark:      '#0f172a',
  textMuted:     '#64748b',
};

/* ─── Feature list ─── */
const FEATURES = [
  { icon: <Calendar className="h-4 w-4" />, title: 'Auto Generate Menu',      desc: 'Fresh menu everyday at 8:00 PM' },
  { icon: <Globe className="h-4 w-4" />,    title: 'Tamil & English Support', desc: 'Use in your language, your way.' },
  { icon: <HeartHandshake className="h-4 w-4" />, title: 'Veg & Non-Veg Rules', desc: 'Balanced. Flexible. Hassle-free.' },
  { icon: <Clock className="h-4 w-4" />,    title: 'Saves Time & Effort',     desc: 'Less planning. More happiness.' },
];

/* ══════════════════════════════════════════════════════════════════
   LOGIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const Login = () => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(true);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState('');

  // WhatsApp Auth
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput]   = useState('');
  const [otpCode, setOtpCode]         = useState('');
  const [otpStep, setOtpStep]         = useState('phone');
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError]     = useState('');
  const [whatsappSuccess, setWhatsappSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { loginWithEmailPassword, loginWithGoogle, requestWhatsappOtp, verifyWhatsappOtp } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    let t = null;
    if (resendTimer > 0) t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const validateForm = () => {
    if (!email.trim())                                    { setError('Email address is required.');           return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.');  return false; }
    if (!password)                                        { setError('Password is required.');                 return false; }
    setError(''); return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;
    setLoading(true); setError('');
    const res = await loginWithEmailPassword(email.trim(), password);
    setLoading(false);
    if (res.success) { addNotification('Login Successful! Welcome back 🎉', 'success'); navigate('/'); }
    else setError(res.error || 'Failed to sign in. Please check your credentials.');
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true); setError('');
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) { addNotification('Google Sign-In Successful! Welcome 🎉', 'success'); navigate('/'); }
    else setError(res.error || 'Google Sign-In failed.');
  };

  const openWhatsappModal = () => {
    setIsWhatsappModalOpen(true); setOtpStep('phone');
    setPhoneInput(''); setOtpCode(''); setWhatsappError(''); setWhatsappSuccess('');
  };
  const closeWhatsappModal = () => {
    setIsWhatsappModalOpen(false); setWhatsappError(''); setWhatsappSuccess(''); setWhatsappLoading(false);
  };

  const handleSendWhatsappOtp = async (e) => {
    if (e) e.preventDefault();
    const raw = phoneInput.trim().replace(/\D/g, '');
    if (!raw || raw.length < 7) { setWhatsappError('Please enter a valid mobile number.'); return; }
    const full = `${countryCode}${raw}`;
    setWhatsappLoading(true); setWhatsappError(''); setWhatsappSuccess('');
    const res = await requestWhatsappOtp(full);
    setWhatsappLoading(false);
    if (res.success) { setOtpStep('otp'); setResendTimer(30); setWhatsappSuccess(res.message || `OTP sent to ${full}.`); }
    else setWhatsappError(res.error || 'Failed to send OTP.');
  };

  const handleVerifyWhatsappOtp = async (e) => {
    if (e) e.preventDefault();
    const clean = otpCode.trim();
    if (clean.length !== 6 || !/^\d{6}$/.test(clean)) { setWhatsappError('Please enter a valid 6-digit OTP.'); return; }
    const full = `${countryCode}${phoneInput.trim().replace(/\D/g, '')}`;
    setWhatsappLoading(true); setWhatsappError(''); setWhatsappSuccess('');
    const res = await verifyWhatsappOtp(full, clean);
    setWhatsappLoading(false);
    if (res.success) {
      setWhatsappSuccess('WhatsApp Authentication Successful! Redirecting...');
      addNotification('WhatsApp Sign-In Successful! Welcome 🎉', 'success');
      setTimeout(() => { closeWhatsappModal(); navigate('/'); }, 800);
    } else setWhatsappError(res.error || 'OTP verification failed. Please try again.');
  };

  /* ── Clean Login Form Content ── */
  const LoginFormContent = ({ isMobile = false }) => (
    <div className={`space-y-4 ${isMobile ? 'w-full max-w-sm mx-auto' : ''}`}>
      {/* Chef Hat Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: `2px solid rgba(249,115,22,0.3)`,
              boxShadow: '0 4px 14px rgba(249,115,22,0.15)',
            }}
          >
            <ChefHat className="h-6 w-6" style={{ color: C.orangePrimary }} />
          </motion.div>
        </div>
        <div>
          <h2
            className="text-[22px] sm:text-[24px] font-extrabold tracking-tight font-['Outfit',sans-serif] leading-tight"
            style={{ color: C.textDark }}
          >
            Welcome Back! 👋
          </h2>
          <p className="text-[11.5px] font-medium mt-0.5" style={{ color: C.textMuted }}>
            Login to manage your smart lunch menus
          </p>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 overflow-hidden"
            style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626' }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <form onSubmit={handleLogin} className="space-y-3 text-left">
        {/* Email */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#475569' }}>
            EMAIL ADDRESS
          </label>
          <div className="relative group">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200"
              style={{ color: '#94a3b8' }}
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-200 outline-none font-['Plus_Jakarta_Sans',sans-serif]"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                color: C.textDark,
              }}
              onFocus={e => { e.target.style.borderColor = C.orangePrimary; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#475569' }}>
            PASSWORD
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200"
              style={{ color: '#94a3b8' }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-200 outline-none font-['Plus_Jakarta_Sans',sans-serif]"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                color: C.textDark,
              }}
              onFocus={e => { e.target.style.borderColor = C.orangePrimary; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors p-0.5"
              style={{ color: '#94a3b8' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer select-none" style={{ color: '#64748b' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded cursor-pointer w-3.5 h-3.5"
              style={{ accentColor: C.orangePrimary }}
            />
            <span className="font-medium">Remember Me</span>
          </label>
          <Link
            to="/forgot-password"
            className="font-bold transition-colors hover:underline"
            style={{ color: C.orangePrimary }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={loading || googleLoading || whatsappLoading}
          className="w-full py-2.5 px-5 text-white font-bold text-xs tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[42px] transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${C.orangePrimary} 0%, ${C.orangeDeep} 100%)`,
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 22px rgba(249,115,22,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(249,115,22,0.35)'; }}
        >
          {loading
            ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
          }
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2.5 py-0.5">
        <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
        <span className="text-[9px] uppercase font-bold tracking-[0.15em]" style={{ color: '#94a3b8' }}>OR</span>
        <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
      </div>

      {/* SSO Buttons */}
      <div className="space-y-2">
        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading || whatsappLoading}
          className="w-full py-2 px-4 font-bold text-[12px] rounded-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 min-h-[40px] transition-all duration-200"
          style={{
            background: 'white',
            border: '1.5px solid #e2e8f0',
            color: '#1e293b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          {googleLoading
            ? <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.orangePrimary} transparent transparent transparent` }} />
            : <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
          }
        </motion.button>

        {/* WhatsApp */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={openWhatsappModal}
          disabled={loading || googleLoading || whatsappLoading}
          className="w-full py-2 px-4 text-white font-bold text-[12px] rounded-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 min-h-[40px] transition-all duration-200"
          style={{ background: '#25D366', boxShadow: '0 2px 10px rgba(37,211,102,0.25)' }}
        >
          <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>Continue with WhatsApp</span>
        </motion.button>
      </div>

      {/* Sign up Link */}
      <p className="text-center text-[11px] font-medium pt-1" style={{ color: C.textMuted }}>
        Don't have an account yet?{' '}
        <Link to="/signup" className="font-bold transition-colors hover:underline" style={{ color: C.orangePrimary }}>
          Create Account
        </Link>
      </p>
    </div>
  );

  /* ══════════════════════════════════════════════
     RENDER MAIN VIEW
  ══════════════════════════════════════════════ */
  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen bg-white">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  MOBILE & SMALL TABLET VIEW (< 768px)                            ║
          ║  Completely clean: No divider, no food carousel, no decorative lines║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="md:hidden min-h-screen flex flex-col justify-center px-4 py-8 bg-slate-50">
        <div className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <LoginFormContent isMobile />
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  DESKTOP VIEW (>= 768px)                                         ║
          ║  Large flowing S-curve divider (15-25% screen width) with       ║
          ║  amber/orange glowing ribbons & centered arrow badge               ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="hidden md:flex relative overflow-hidden h-screen max-h-screen">

        {/* ── LEFT BRANDING PANEL (Dark Charcoal / Deep Dark Green) ── */}
        <div
          className="w-[55%] flex flex-col relative overflow-hidden h-full py-6 justify-between z-10"
          style={{
            background: `linear-gradient(150deg, ${C.darkBg} 0%, ${C.darkMid} 55%, ${C.darkSoft} 100%)`,
          }}
        >
          {/* Subtle ambient orange/amber glows */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.22, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-10%] right-[-8%] rounded-full pointer-events-none"
            style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.22), transparent 65%)', filter: 'blur(35px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.15, 0.06] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-[-8%] left-[-6%] rounded-full pointer-events-none"
            style={{ width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(245,158,11,0.18), transparent 65%)', filter: 'blur(30px)' }}
          />

          {/* Top Branding Section */}
          <div>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center gap-2.5 px-8 pt-2 sm:px-10"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.35)', color: C.orangeLight }}
              >
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight font-['Outfit',sans-serif]" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>Smart Lunch Generator</h1>
                <span className="text-[8.5px] font-extrabold uppercase tracking-[0.22em] block" style={{ color: '#fb923c' }}>AUTOMATED DAILY MENUS</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 px-8 sm:px-10 mt-4 space-y-0.5"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.08] font-['Outfit',sans-serif]">
                <span className="block" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Plan Smarter.</span>
                <span style={{ color: C.orangePrimary, textShadow: '0 0 24px rgba(249,115,22,0.6)' }}>
                  Serve Better.
                </span>
              </h2>
              <p className="font-bold text-xs sm:text-sm tracking-wide mt-1" style={{ color: '#fed7aa' }}>
                Every Lunch, Perfect!
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative z-10 px-8 sm:px-10 mt-4"
            >
              <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 max-w-md">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}
                    >
                      {f.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold leading-tight block truncate" style={{ color: '#ffffff' }}>{f.title}</span>
                      <span className="text-[9.5px] font-semibold leading-tight block truncate" style={{ color: '#ffedd5' }}>{f.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Food Carousel Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative z-10 flex-1 flex items-center justify-center px-4 my-auto"
            style={{ minHeight: 0 }}
          >
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'center center' }}>
              <FoodCarousel />
            </div>
          </motion.div>
        </div>

        {/* ── BROAD, ELEGANT FLOWING S-CURVE DIVIDER (Occupies ~20% of Screen Width) ── */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none h-full"
          style={{ left: 'calc(55% - 150px)', width: '320px' }}
        >
          {/* Layered Liquid Wave SVG */}
          <motion.svg
            viewBox="0 0 400 1000"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              {/* Warm Orange/Amber Flowing Glow Gradient */}
              <linearGradient id="orangeFlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#fb923c" stopOpacity="0.9" />
                <stop offset="50%"  stopColor="#f97316" stopOpacity="1" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="amberGlowLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="50%"  stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
              </linearGradient>

              {/* Glowing Blur Filter */}
              <filter id="orangeWaveGlow" x1="-20%" y1="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Main White/Cream Background Fill creating the smooth wide S-curve boundary */}
            <path
              d="M 400 0 
                 L 400 1000 
                 L 220 1000 
                 C 320 820, 80 660, 200 480 
                 C 320 300, 100 120, 260 0 
                 Z"
              fill="white"
            />

            {/* 2. Soft Cream/Off-white transition layer stroke */}
            <path
              d="M 252 0 
                 C 92 120, 312 300, 192 480 
                 C 72 660, 312 820, 212 1000"
              fill="none"
              stroke="#fffbf5"
              strokeWidth="14"
              strokeOpacity="0.6"
            />

            {/* 3. Primary Warm Orange Flow Accent Ribbon (Smooth continuous curve) */}
            <motion.path
              d="M 258 0 
                 C 98 120, 318 300, 198 480 
                 C 78 660, 318 820, 218 1000"
              fill="none"
              stroke="url(#orangeFlowGradient)"
              strokeWidth="5"
              filter="url(#orangeWaveGlow)"
              animate={{
                d: [
                  "M 258 0 C 98 120, 318 300, 198 480 C 78 660, 318 820, 218 1000",
                  "M 262 0 C 104 120, 314 300, 202 480 C 82 660, 314 820, 222 1000",
                  "M 258 0 C 98 120, 318 300, 198 480 C 78 660, 318 820, 218 1000"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 4. Subtle Glowing Amber Highlight Ribbon */}
            <path
              d="M 266 0 
                 C 106 120, 326 300, 206 480 
                 C 86 660, 326 820, 226 1000"
              fill="none"
              stroke="url(#amberGlowLine)"
              strokeWidth="2.5"
              strokeDasharray="12 8"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="6s" repeatCount="indefinite" />
            </path>
          </motion.svg>
        </div>

        {/* ── CENTER CIRCULAR ARROW BADGE (Positioned at exact visual center) ── */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-full pointer-events-none select-none"
          style={{
            left: 'calc(55% - 26px)',
            width: '52px',
            height: '52px',
            background: 'radial-gradient(circle at 35% 35%, #1a2c22 0%, #08120d 100%)',
            border: '2.5px solid #f97316',
            boxShadow: '0 0 25px rgba(249,115,22,0.45), 0 4px 18px rgba(0,0,0,0.5)',
          }}
        >
          <ChevronsRight className="h-6 w-6 text-[#fb923c]" />
        </motion.div>

        {/* ── RIGHT PANEL (White Background with Login Card) ── */}
        <div
          className="w-[45%] flex items-center justify-center px-8 py-6 h-full"
          style={{ background: 'white' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="w-full max-w-[370px] relative z-30"
          >
            {/* Floating Login Card */}
            <div
              className="rounded-3xl px-6 py-6 sm:px-7 sm:py-7"
              style={{
                background: 'white',
                boxShadow: '0 10px 45px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.03)',
                border: '1px solid rgba(249,115,22,0.1)',
              }}
            >
              <LoginFormContent />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          WHATSAPP OTP MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isWhatsappModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(8,18,13,0.65)', backdropFilter: 'blur(6px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'white', border: '1px solid rgba(249,115,22,0.1)' }}
            >
              {/* Modal Header */}
              <div
                className="p-5 text-white relative"
                style={{ background: `linear-gradient(135deg, ${C.darkBg} 0%, ${C.darkMid} 100%)` }}
              >
                <button type="button" onClick={closeWhatsappModal}
                  className="absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white font-['Outfit',sans-serif]">Continue with WhatsApp</h3>
                    <p className="text-[11px] font-medium" style={{ color: C.orangeLight }}>Instant OTP verification via WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3.5">
                {whatsappError && (
                  <div className="p-2.5 text-xs font-semibold rounded-xl flex items-center gap-2" style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626' }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" /><span>{whatsappError}</span>
                  </div>
                )}
                {whatsappSuccess && (
                  <div className="p-2.5 text-xs font-semibold rounded-xl flex items-center gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" /><span>{whatsappSuccess}</span>
                  </div>
                )}

                {otpStep === 'phone' && (
                  <form onSubmit={handleSendWhatsappOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#475569' }}>WhatsApp Mobile Number</label>
                      <div className="flex gap-2">
                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                          className="px-2.5 py-2 rounded-xl text-xs font-bold outline-none"
                          style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: C.textDark }}
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
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#94a3b8' }} />
                          <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="98765 43210" required
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold outline-none"
                            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: C.textDark }}
                          />
                        </div>
                      </div>
                      <p className="text-[10.5px] mt-1 font-medium" style={{ color: C.textMuted }}>We will send a 6-digit verification code to your WhatsApp.</p>
                    </div>
                    <button type="submit" disabled={whatsappLoading}
                      className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                      style={{ background: '#25D366' }}
                    >
                      {whatsappLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><MessageSquare className="h-3.5 w-3.5" /><span>Send OTP via WhatsApp</span></>}
                    </button>
                  </form>
                )}

                {otpStep === 'otp' && (
                  <form onSubmit={handleVerifyWhatsappOtp} className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Enter 6-Digit OTP</label>
                        <button type="button" onClick={() => { setOtpStep('phone'); setOtpCode(''); setWhatsappError(''); }}
                          className="text-[10.5px] font-bold flex items-center gap-1 cursor-pointer" style={{ color: C.orangePrimary }}
                        >
                          <ArrowLeft className="h-3 w-3" /><span>Change Number</span>
                        </button>
                      </div>
                      <input type="text" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} placeholder="• • • • • •" autoFocus required
                        className="w-full text-center py-2.5 text-xl font-extrabold tracking-widest rounded-xl outline-none font-mono"
                        style={{ background: '#f8fafc', border: `2px solid rgba(249,115,22,0.25)`, color: C.textDark }}
                      />
                      <p className="text-[10.5px] mt-1 font-medium text-center" style={{ color: C.textMuted }}>Code sent to <strong style={{ color: C.textDark }}>{countryCode} {phoneInput}</strong></p>
                    </div>
                    <button type="submit" disabled={whatsappLoading || otpCode.length !== 6}
                      className="w-full py-3 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                      style={{ background: `linear-gradient(135deg, ${C.orangePrimary}, ${C.orangeDeep})` }}
                    >
                      {whatsappLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck className="h-3.5 w-3.5" /><span>Verify & Sign In</span></>}
                    </button>
                    <div className="text-center pt-0.5">
                      {resendTimer > 0
                        ? <span className="text-[11px] font-medium" style={{ color: C.textMuted }}>Resend code in <strong style={{ color: C.textDark }}>{resendTimer}s</strong></span>
                        : <button type="button" onClick={handleSendWhatsappOtp} disabled={whatsappLoading}
                            className="text-[11px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer" style={{ color: C.orangePrimary }}
                          >
                            <RefreshCw className="h-3 w-3" /><span>Resend OTP via WhatsApp</span>
                          </button>
                      }
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
