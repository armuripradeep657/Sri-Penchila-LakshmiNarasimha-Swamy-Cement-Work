'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  UserPlus,
  LogIn,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/shared/Logo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const { language, t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const raw = identifier.trim();
    if (!raw) {
      setError(language === 'te' ? 'దయచేసి మొబైల్ నంబర్ లేదా ఇమెయిల్ నమోదు చేయండి' : 'Please enter your mobile number or email address');
      return;
    }

    if (!raw.includes('@')) {
      const cleanPhone = raw.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        setError(language === 'te' ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
        return;
      }
    }

    if (password.length < 6) {
      setError(language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి' : 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(raw, password);

      if (user?.role === 'ADMIN' && redirectUrl === '/') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'లాగిన్ విఫలమైంది. దయచేసి మీ వివరాలు తనిఖీ చేయండి.' : 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'te' ? 'పోర్టల్ లాగిన్' : 'Sign In'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {language === 'te'
              ? 'మీ మొబైల్ నంబర్ లేదా ఇమెయిల్ మరియు పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.'
              : 'Sign in with your mobile number or email and password.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-slate-900/70 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mobile Number or Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'te' ? 'మొబైల్ నంబర్ లేదా ఇమెయిల్' : 'Mobile Number or Email'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="9912179771 or prasad@prasadcement.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 tracking-wide"
                />
              </div>
            </div>

            {/* Password with Forgot Password link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}</span>
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? '...' : (language === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-3">
              {language === 'te' ? 'ఖాతా లేదా?' : "Don't have an account?"}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-950 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 transition-all hover:scale-[1.02] shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'te' ? 'కొత్త ఖాతా సృష్టించండి' : 'Create New Account'}</span>
            </Link>
          </div>
        </div>

        {/* Demo Quick Access */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5 text-xs shadow-lg">
          <div className="flex items-center justify-between">
            <p className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              ⚡ {language === 'te' ? 'డెమో క్విక్ యాక్సెస్' : 'Demo Quick Access'}
            </p>
            <span className="text-[10px] text-slate-500">
              {language === 'te' ? 'క్లిక్ చేసి తక్షణ లాగిన్' : 'Click to auto-fill & login'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => { setIdentifier('9912179771'); setPassword('prasad@123'); setError(''); }}
              className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-500 text-left transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">👑 PRASAD</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {language === 'te' ? 'అడ్మిన్' : 'Admin'}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono block mt-1">9912179771</span>
              <span className="text-[10px] text-slate-400 block truncate">prasad@prasadcement.com</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Pass: prasad@123</span>
            </button>

            <button
              type="button"
              onClick={() => { setIdentifier('8888888888'); setPassword('rajesh@123'); setError(''); }}
              className="p-3 rounded-xl bg-slate-950 border border-blue-500/40 hover:border-blue-500 text-left transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300">🏗️ Rajesh</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {language === 'te' ? 'కస్టమర్' : 'Customer'}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono block mt-1">8888888888</span>
              <span className="text-[10px] text-slate-400 block truncate">rajesh@gmail.com</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Pass: rajesh@123</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{language === 'te' ? 'ఎన్‌క్రిప్టెడ్ సెషన్ • సురక్షిత ప్రవేశం' : 'Encrypted Session • Secure Access'}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
