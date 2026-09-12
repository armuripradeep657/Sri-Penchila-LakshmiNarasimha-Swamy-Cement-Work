'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Layers,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

function ForgotPasswordContent() {
  const router = useRouter();
  const { language } = useLanguage();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError(language === 'te' ? 'దయచేసి మీ మొబైల్ నంబర్ లేదా ఇమెయిల్ నమోదు చేయండి' : 'Please enter your mobile number or email address');
      return;
    }

    if (!trimmed.includes('@')) {
      const cleanPhone = trimmed.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        setError(language === 'te' ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(trimmed);
      if (res.success) {
        if (res.demoOtp) {
          setDemoOtp(res.demoOtp);
          setOtpCode(res.demoOtp);
        }
        setSuccessMsg(res.message || 'OTP sent successfully!');
        setStep('reset');
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'OTP పంపడం విఫలమైంది. దయచేసి తనిఖీ చేయండి.' : 'Failed to send OTP. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.trim().length < 4) {
      setError(language === 'te' ? 'దయచేసి 6-అంకెల OTP నమోదు చేయండి' : 'Please enter the 6-digit OTP code');
      return;
    }

    if (newPassword.length < 6) {
      setError(language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(identifier.trim(), otpCode.trim(), newPassword);
      if (res.success) {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది.' : 'Password reset failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/25">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'te' ? 'పాస్‌వర్డ్ రీసెట్' : 'Reset Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {step === 'request'
              ? (language === 'te'
                  ? 'మీ నమోదిత మొబైల్ నంబర్ లేదా ఇమెయిల్ నమోదు చేయండి.'
                  : 'Enter your registered mobile number or email to receive a reset OTP code.')
              : step === 'reset'
              ? (language === 'te'
                  ? 'OTP మరియు మీ కొత్త పాస్‌వర్డ్ నమోదు చేయండి.'
                  : 'Enter the OTP and set your new account password.')
              : (language === 'te'
                  ? 'మీ పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది!'
                  : 'Your password has been successfully reset!')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Card Container */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-slate-900/70 shadow-2xl">
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'మొబైల్ నంబర్ లేదా ఇమెయిల్' : 'Mobile Number or Email'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="9912179771 or prasad@prasadcement.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? '...' : (language === 'te' ? 'OTP కోడ్ పొందండి' : 'Send Reset Code')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {demoOtp && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                  <span>⚡ Demo OTP: <strong className="font-mono text-white text-sm">{demoOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoOtp)}
                    className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* OTP Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? '6-అంకెల OTP కోడ్' : '6-Digit OTP Code'}</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-center text-white font-mono tracking-widest text-lg font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'కొత్త పాస్‌వర్డ్' : 'New Password'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {language === 'te' ? 'పాస్‌వర్డ్ నిర్ధారించండి' : 'Confirm New Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? '...' : (language === 'te' ? 'పాస్‌వర్డ్ మార్చండి' : 'Update Password')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-white">
                {language === 'te' ? 'పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!' : 'Password Reset Successful!'}
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'te'
                  ? 'మీ కొత్త పాస్‌వర్డ్‌తో ఇప్పుడు లాగిన్ అవ్వవచ్చు.'
                  : 'You can now sign in to your account with your new password.'}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <span>{language === 'te' ? 'లాగిన్ పేజీకి వెళ్లండి' : 'Proceed to Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'లాగిన్‌కు తిరిగి వెళ్లండి' : 'Back to Sign In'}</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{language === 'te' ? 'రక్షిత పాస్‌వర్డ్ పునరుద్ధరణ' : 'Secure Account Recovery'}</span>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
