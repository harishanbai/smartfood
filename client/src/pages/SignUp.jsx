import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerWithEmailPassword } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkPasswordRules = (pwd) => {
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
  };

  const rules = checkPasswordRules(formData.password);

  const validateForm = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return false;
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError('Name must be between 2 and 50 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!rules.minLength || !rules.hasUpper || !rules.hasLower || !rules.hasNumber || !rules.hasSpecial) {
      setError('Password does not meet all security requirements.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
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

    const res = await registerWithEmailPassword({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password
    });

    setLoading(false);

    if (res.success) {
      addNotification('Account Created Successfully! 🎉 Verification email sent.', 'success');
      navigate('/');
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
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
            <linearGradient id="suWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M 80 0 C 30 120, 10 200, 35 320 C 60 440, 5 520, 25 640 C 45 760, 15 840, 80 900 L 80 0 Z" fill="white" />
          <path d="M 0 0 C 50 120, 70 200, 45 320 C 20 440, 75 520, 55 640 C 35 760, 65 840, 0 900 L 0 0 Z" fill="url(#suWaveFill)" />
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Create Account 🚀
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Join Smart Lunch Generator &amp; automate your meals
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* 1. Name Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Hareesh Balamurugan"
                  minLength={2}
                  maxLength={50}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 2. Email Address Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 3. Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Password Rules Indicator */}
              {formData.password && (
                <div className="grid grid-cols-2 gap-1 mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
                  <div className={`flex items-center gap-1 ${rules.minLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3 w-3" /> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-1 ${rules.hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3 w-3" /> Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${rules.hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3 w-3" /> Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${rules.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3 w-3" /> Number (0-9)
                  </div>
                  <div className={`flex items-center gap-1 col-span-2 ${rules.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3 w-3" /> Special Character (!@#$%^&*)
                  </div>
                </div>
              )}
            </div>

            {/* 4. Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4 min-h-[46px]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Sign In */}
          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
              Sign In
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default SignUp;
