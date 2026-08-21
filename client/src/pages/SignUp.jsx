import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
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
