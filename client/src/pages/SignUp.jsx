import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChefHat, 
  Calendar, 
  HeartHandshake, 
  Globe, 
  Clock, 
  ShieldCheck, 
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
import { useLanguage } from '../context/LanguageContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'en',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerWithEmailPassword } = useAuth();
  const { addNotification } = useNotifications();
  const { language: currentLang, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last names are required.');
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
    if (!formData.agreeTerms) {
      setError('You must accept the Terms & Conditions to proceed.');
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
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      language: formData.language
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
            onClick={() => setLanguage(currentLang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
          >
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>{currentLang === 'en' ? 'English' : 'தமிழ்'}</span>
            <span className="text-[10px] text-slate-400 font-mono">▼</span>
          </button>
        </div>

        {/* Main Form Area */}
        <div className="max-w-md w-full mx-auto my-auto space-y-4 text-center">
          
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Create Account 🚀
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Join Smart Lunch Generator &amp; automate your meals
            </p>
          </div>

          {/* Section Tab Header */}
          <div className="flex flex-col items-center justify-center pb-1">
            <span className="text-emerald-700 font-bold text-xs tracking-wide uppercase">
              Registration
            </span>
            <div className="w-12 h-1 bg-emerald-600 rounded-full mt-1 shadow-sm" />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email & Language Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
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
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                </select>
              </div>
            </div>

            {/* Password */}
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
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Rules */}
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

            {/* Confirm Password */}
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
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
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

            {/* T&C */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>
                  I agree to the <span className="text-slate-900 font-semibold">Terms &amp; Conditions</span> and <span className="text-slate-900 font-semibold">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3 min-h-[46px]"
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

        {/* BOTTOM SECURITY CARD */}
        <div className="mt-4 pt-2">
          <div className="max-w-md mx-auto bg-emerald-50/80 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3 text-left">
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

    </div>
  );
};

export default SignUp;
