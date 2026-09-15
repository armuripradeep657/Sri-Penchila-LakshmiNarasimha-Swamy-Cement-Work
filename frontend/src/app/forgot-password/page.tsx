'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RotateCcw,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

function generateCaptchaCode(length = 5): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function ForgotPasswordContent() {
  const router = useRouter();
  const { language } = useLanguage();

  const [step, setStep] = useState<'captcha' | 'new_password' | 'success'>('captcha');
  const [mobileNumber, setMobileNumber] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Render Canvas CAPTCHA with visual distortions & noise ─────────────────
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.8 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distraction lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.3,
        Math.random() * height,
        width * 0.7,
        Math.random() * height,
        width - Math.random() * 20,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Draw characters with distinct rotations and colors
    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#a855f7'];
    const charWidth = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = (i + 1) * charWidth - 6;
      const y = height / 2 + Math.random() * 6 - 3;
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = colors[i % colors.length];
      ctx.textBaseline = 'middle';
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setCaptchaInput('');
    setTimeout(() => drawCaptcha(newCode), 50);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // ─── Step 1: Verify Mobile Number & CAPTCHA ────────────────────────────────
  const handleVerifyCaptcha = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError(
        language === 'te'
          ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError(
        language === 'te'
          ? 'తప్పుడు క్యాప్చా కోడ్. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Invalid Captcha code entered. Please try again.'
      );
      refreshCaptcha();
      return;
    }

    // Captcha & phone verified! Unlock access to set new password
    setStep('new_password');
  };

  // ─── Step 2: Set New Password ──────────────────────────────────────────────
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(
        language === 'te'
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        language === 'te'
          ? 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు'
          : 'Passwords do not match'
      );
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = mobileNumber.replace(/\D/g, '').slice(-10);
      await api.directResetPassword(cleanPhone, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(
        err.message ||
          (language === 'te'
            ? 'పాస్‌వర్డ్ మార్చడం విఫలమైంది. దయచేసి తనిఖీ చేయండి.'
            : 'Password change failed. Please check your mobile number.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/25">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'te' ? 'పాస్‌వర్డ్ రికవరీ & రీసెట్' : 'Account Password Reset'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {step === 'captcha'
              ? language === 'te'
                ? 'మొబైల్ నంబర్ మరియు క్రింది క్యాప్చా కోడ్‌ను నమోదు చేయండి.'
                : 'Enter your registered mobile number and captcha code to change password.'
              : step === 'new_password'
              ? language === 'te'
                ? 'మీ ఖాతా కోసం కొత్త పాస్‌వర్డ్ సెట్ చేయండి.'
                : 'Captcha verified! Please set your new secure password.'
              : language === 'te'
              ? 'మీ పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!'
              : 'Your password has been successfully updated!'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Card Container */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-slate-900/80 shadow-2xl space-y-5">
          {/* ─── STEP 1: MOBILE NUMBER + CAPTCHA ────────────────────────────── */}
          {step === 'captcha' && (
            <form onSubmit={handleVerifyCaptcha} className="space-y-4">
              {/* Mobile Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'నమోదిత మొబైల్ నంబర్' : 'Registered Mobile Number'}</span>
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-amber-500">
                  <span className="text-sm font-mono text-slate-400 pr-2.5 border-r border-slate-800">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9912179771"
                    className="w-full bg-transparent pl-3 text-sm text-white font-mono focus:outline-none placeholder-slate-500 tracking-wider"
                  />
                </div>
              </div>

              {/* Visual Canvas CAPTCHA */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'te' ? 'సెక్యూరిటీ క్యాప్చా కోడ్' : 'Security Captcha Code'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    title="Generate new captcha code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Refresh Captcha</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 shrink-0">
                    <canvas
                      ref={canvasRef}
                      width={170}
                      height={48}
                      className="block cursor-pointer"
                      onClick={refreshCaptcha}
                      title="Click to refresh captcha"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-center font-mono font-bold tracking-widest text-white uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Type the distorted characters shown above to verify you are a real person.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all mt-3 cursor-pointer"
              >
                <span>{language === 'te' ? 'క్యాప్చా ధృవీకరించి కొనసాగండి' : 'Verify Captcha & Change Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ─── STEP 2: SET NEW PASSWORD ───────────────────────────────────── */}
          {step === 'new_password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              {/* Verified Badge */}
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  Mobile +91 {mobileNumber.slice(-10)} successfully verified by Captcha!
                </span>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'కొత్త పాస్‌వర్డ్' : 'New Password'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 mt-3 cursor-pointer"
              >
                <span>{isLoading ? 'Updating...' : language === 'te' ? 'పాస్‌వర్డ్ మార్చండి' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ─── STEP 3: SUCCESS ────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-white">
                {language === 'te' ? 'పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!' : 'Password Reset Successful!'}
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'te'
                  ? 'మీ కొత్త పాస్‌వర్డ్‌తో ఇప్పుడు లాగిన్ అవ్వవచ్చు.'
                  : 'Your account password has been updated. You can now log in immediately.'}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
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
