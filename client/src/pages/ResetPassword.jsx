import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Calendar, 
  HeartHandshake, 
  Globe, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { auth, confirmPasswordReset, verifyPasswordResetCode } from '../firebase';
import { authApi } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const verifyResetParams = async () => {
      // 1. Firebase oobCode flow (password reset via Firebase email)
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

      // 2. Backend token flow (password reset via Nodemailer email)
      if (token && emailParam) {
        try {
          const res = await authApi.verifyResetToken(token, emailParam);
          if (res?.data?.success) {
            setUserEmail(res.data.email || emailParam);
            setValidCode(true);
            setError('');
          } else {
            setValidCode(false);
            setError(res?.data?.message || 'Reset link is invalid.');
          }
        } catch (err) {
          setValidCode(false);
          const code = err?.response?.data?.code;
          const msg = err?.response?.data?.message;
          if (code === 'EXPIRED_TOKEN') {
            setError('This reset link has expired. Please request a new password reset link.');
          } else if (code === 'INVALID_TOKEN') {
            setError('This reset link is invalid or has already been used.');
          } else if (code === 'USER_NOT_FOUND') {
            setError('No account found with this email address.');
          } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(msg || 'Reset link is invalid or has expired. Please request a new one.');
          }
        } finally {
          setVerifying(false);
        }
        return;
      }

      // 3. No token at all — redirect to login
      navigate('/login', { replace: true });
    };

    verifyResetParams();
  }, [oobCode, token, emailParam, navigate]);

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
        await confirmPasswordReset(auth, oobCode, newPassword);
      } else if (token && emailParam) {
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
        const code = err?.response?.data?.code;
        const msg = err?.response?.data?.message;
        if (code === 'EXPIRED_TOKEN') {
          setError('This reset link has expired. Please request a new password reset link.');
        } else if (code === 'INVALID_TOKEN') {
          setError('This reset link is invalid or has already been used.');
        } else if (code === 'USER_NOT_FOUND') {
          setError('No account found with this email address.');
        } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(msg || err.message || 'Failed to reset password. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden font-sans relative">
      
      {/* LEFT PANEL */}
      <div className="w-full md:w-[55%] bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 p-8 sm:p-12 md:pr-16 text-white flex flex-col justify-between relative overflow-visible">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <ChefHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white">Smart Lunch Generator</h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Automated Daily Menus</span>
          </div>
        </div>

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
            <linearGradient id="rpWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M 80 0 C 30 120, 10 200, 35 320 C 60 440, 5 520, 25 640 C 45 760, 15 840, 80 900 L 80 0 Z" fill="white" />
          <path d="M 0 0 C 50 120, 70 200, 45 320 C 20 440, 75 520, 55 640 C 35 760, 65 840, 0 900 L 0 0 Z" fill="url(#rpWaveFill)" />
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

      {/* RIGHT PANEL */}
      <div className="w-full md:w-[45%] bg-white p-6 sm:p-10 md:p-12 flex items-center justify-center relative min-h-screen md:min-h-0">
        
        {/* Main Form Area */}
        <div className="max-w-md w-full my-auto space-y-5 text-center">
          
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

      </div>

    </div>
  );
};

export default ResetPassword;
