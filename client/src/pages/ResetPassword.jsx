import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChefHat, 
  Calendar, 
  HeartHandshake, 
  Globe, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { auth, confirmPasswordReset, verifyPasswordResetCode } from '../firebase';
import { authApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  // Extract params
  const oobCode = searchParams.get('oobCode');
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [userEmail, setUserEmail] = useState(emailParam);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Check code or token validity on mount
  useEffect(() => {
    const verifyResetParams = async () => {
      // 1. Firebase standard oobCode flow
      if (oobCode) {
        try {
          const emailFromCode = await verifyPasswordResetCode(auth, oobCode);
          setUserEmail(emailFromCode);
          setValidCode(true);
          setError('');
        } catch (err) {
          console.error("Firebase verifyPasswordResetCode error:", err);
          setValidCode(false);
          if (err.code === 'auth/invalid-action-code') {
            setError('This password reset link is invalid or has already been used.');
          } else if (err.code === 'auth/expired-action-code') {
            setError('This password reset link has expired. Please request a new one.');
          } else {
            setError('Invalid or expired password reset link. Please request a new one.');
          }
        } finally {
          setVerifying(false);
        }
        return;
      }

      // 2. Custom backend token flow
      if (token && emailParam) {
        setValidCode(true);
        setUserEmail(emailParam);
        setVerifying(false);
        return;
      }

      // 3. No parameters provided
      setValidCode(false);
      setError('No reset code or token found in the URL link. Please request a new password reset link.');
      setVerifying(false);
    };

    verifyResetParams();
  }, [oobCode, token, emailParam]);

  // Password rules validation
  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword
  };

  const isFormValid = rules.length && rules.upper && rules.lower && rules.number && rules.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError('');

    try {
      if (oobCode) {
        // Reset via Firebase Auth Client SDK
        await confirmPasswordReset(auth, oobCode, newPassword);
      } else if (token && emailParam) {
        // Reset via Backend Nodemailer / MongoDB Token API
        const res = await authApi.resetPassword(token, emailParam, newPassword);
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || 'Failed to reset password.');
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      console.error("Password reset execution error:", err);
      if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setError('This reset link has expired or was already used. Please request a new reset link.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
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
          
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create New Password 🔒
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              {userEmail ? (
                <>Setting new password for <strong className="text-emerald-700">{userEmail}</strong></>
              ) : (
                'Enter a strong new password to update your account'
              )}
            </p>
          </div>

          {/* Section Tab Header */}
          <div className="flex flex-col items-center justify-center pb-1">
            <span className="text-emerald-700 font-bold text-xs tracking-wide uppercase">
              Secure Account Update
            </span>
            <div className="w-12 h-1 bg-emerald-600 rounded-full mt-1 shadow-sm" />
          </div>

          {verifying ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-600">Verifying reset link credentials...</p>
            </div>
          ) : submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h3 className="text-base font-bold text-slate-900">Password Changed Successfully!</h3>
              
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left">
                Your password has been updated. You will be redirected to the login page automatically in a few seconds...
              </p>

              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Proceed to Sign In</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          ) : !validCode ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="h-7 w-7" />
              </div>

              <h3 className="text-base font-bold text-slate-900">Invalid Reset Link</h3>
              
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl text-left">
                {error || 'This password reset link is invalid or has expired.'}
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/forgot-password"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request New Reset Link</span>
                </Link>

                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements List */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className={rules.length ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {rules.length ? '✓' : '•'} At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={rules.upper && rules.lower ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {rules.upper && rules.lower ? '✓' : '•'} Uppercase and lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={rules.number ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {rules.number ? '✓' : '•'} At least one number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={rules.match ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {rules.match ? '✓' : '•'} Passwords match
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
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

    </div>
  );
};

export default ResetPassword;
