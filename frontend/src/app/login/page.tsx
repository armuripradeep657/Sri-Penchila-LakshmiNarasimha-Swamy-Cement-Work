'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, loginWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [socialNotification, setSocialNotification] = useState<string | null>(null);
  const [error, setError] = useState('');

  // ─── Standard Email/Mobile Login ────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSocialNotification(null);

    const raw = identifier.trim();
    if (!raw) {
      setError(
        language === 'te'
          ? 'దయచేసి మొబైల్ నంబర్ లేదా ఇమెయిల్ నమోదు చేయండి'
          : 'Please enter your email address or mobile number'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        language === 'te'
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి'
          : 'Password must be at least 6 characters'
      );
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
      setError(
        err.message ||
          (language === 'te'
            ? 'లాగిన్ విఫలమైంది. వివరాలు తనిఖీ చేయండి.'
            : 'Login failed. Please check your credentials.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Direct Google Login ───────────────────────────────────────────────────
  const handleDirectGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    setSocialNotification(
      language === 'te' ? 'గూగుల్ ఖాతాతో లాగిన్ అవుతున్నారు...' : 'Connecting to Google Account...'
    );

    try {
      const user = await loginWithGoogle({
        name: 'Google Verified User',
        email: 'user.google@gmail.com',
        phone: '9912179771',
      });

      setSocialNotification(
        language === 'te'
          ? 'గూగుల్ ఖాతాతో విజయవంతంగా లాగిన్ అయ్యారు!'
          : `Signed in as ${user.name} (${user.email})!`
      );

      setTimeout(() => {
        if (user?.role === 'ADMIN' && redirectUrl === '/') {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
      setSocialNotification(null);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ─── Apple / X Mock / Instant Access ──────────────────────────────────────
  const handleAppleOrXLogin = (provider: 'Apple' | 'X') => {
    setError('');
    setSocialNotification(`${provider} authentication is ready! Click "Google" for 1-click sign-in or use Demo Access.`);
    setTimeout(() => setSocialNotification(null), 4000);
  };

  // ─── One-Click Demo Access ─────────────────────────────────────────────────
  const handleOneClickDemo = async (role: 'ADMIN' | 'CUSTOMER') => {
    setError('');
    setSocialNotification(null);
    setIsLoading(true);

    const demoUser =
      role === 'ADMIN'
        ? { id: '9912179771', pass: 'prasad@123' }
        : { id: '8888888888', pass: 'rajesh@123' };

    setIdentifier(demoUser.id);
    setPassword(demoUser.pass);

    try {
      const user = await login(demoUser.id, demoUser.pass);
      if (user?.role === 'ADMIN' && redirectUrl === '/') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-10 bg-[#0a0d14] overflow-hidden">
      {/* ─── APP LOGO WATERMARK BACKGROUND (Visible Behind Card) ─────────────── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Ambient color flares */}
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -top-32 -left-32"></div>
        <div className="absolute w-[650px] h-[650px] bg-amber-500/10 rounded-full blur-[140px] -bottom-32 -right-32"></div>
        <div className="absolute w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

        {/* Large Visible App Logo Watermark */}
        <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[650px] md:h-[650px] opacity-[0.14] transition-all duration-1000 scale-105 select-none">
          <Image
            src="/images/logo.png"
            alt="Sri Penchila LakshmiNarasimha Swamy Cement Work Logo Watermark"
            fill
            priority
            sizes="650px"
            className="object-contain filter grayscale-[20%] brightness-110 contrast-125"
          />
        </div>

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        ></div>
      </div>

      {/* ─── MAIN LOGIN CONTAINER ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[420px] space-y-5">
        {/* Top Logo Badge with Matrix Dots (Matching Reference Image) */}
        <div className="flex items-center justify-center gap-4 select-none">
          {/* Left Matrix Dots */}
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline-block"></span>
          </div>

          {/* Centered Squircle Badge with Logo & Glowing Halo */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-500/40 via-blue-500/30 to-amber-500/30 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#10141f] border border-slate-700/80 p-2 shadow-2xl flex items-center justify-center">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="Sri Penchila LakshmiNarasimha Swamy Logo"
                  fill
                  priority
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right Matrix Dots */}
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline-block"></span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
          </div>
        </div>

        {/* Heading & Sign Up Prompt */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {language === 'te' ? 'స్వాగతం' : 'Welcome Back'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'te' ? 'ఖాతా లేదా? ' : "Don't have an account yet? "}
            <Link
              href="/register"
              className="text-white font-semibold hover:text-blue-400 transition-colors underline-offset-4 hover:underline"
            >
              {language === 'te' ? 'ఖాతా తెరవండి' : 'Sign up'}
            </Link>
          </p>
        </div>

        {/* Notifications & Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {socialNotification && (
          <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{socialNotification}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#0f1422]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Identifier Input */}
            <div className="space-y-1">
              <div className="relative flex items-center bg-[#131929] border border-slate-700/70 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                <span className="pl-4 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email address"
                  className="w-full bg-transparent text-white text-sm px-3.5 py-3.5 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative flex items-center bg-[#131929] border border-slate-700/70 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                <span className="pl-4 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-white text-sm px-3.5 py-3.5 pr-11 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password subtle link */}
              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot password?'}
                </Link>
              </div>
            </div>

            {/* Vibrant Blue Login Button (Exact Reference Match) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#1565cf] active:scale-[0.99] transition-all shadow-lg shadow-[#1877f2]/25 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>{language === 'te' ? 'లాగిన్' : 'Login'}</span>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">OR</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* Social Login Buttons: Apple, Google (Direct), X */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Apple Button */}
            <button
              type="button"
              onClick={() => handleAppleOrXLogin('Apple')}
              className="py-3 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all group"
              title="Sign in with Apple"
            >
              <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.65-2.8 1.45-.6.7-.1.13-1.84.97-3.03 1.07-.03 2.18.68 2.84 1.48z" />
              </svg>
            </button>

            {/* Google Direct Login Button */}
            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              disabled={isGoogleLoading}
              className="py-3 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all group relative"
              title="Direct Google Login"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
            </button>

            {/* X (Twitter) Button */}
            <button
              type="button"
              onClick={() => handleAppleOrXLogin('X')}
              className="py-3 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all group"
              title="Sign in with X"
            >
              <svg className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── QUICK DEMO ACCESS SECTION (One-Click Testing) ────────────────── */}
        <div className="bg-[#0f1422]/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'te' ? 'డెమో తక్షణ యాక్సెస్' : 'Demo 1-Click Access'}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {language === 'te' ? 'తక్షణమే లాగిన్ అవ్వండి' : 'Auto-fill & Sign In'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Prasad Admin Demo Button */}
            <button
              type="button"
              onClick={() => handleOneClickDemo('ADMIN')}
              className="p-2.5 rounded-xl bg-[#131929] border border-amber-500/30 hover:border-amber-400 hover:bg-[#182136] text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  👑 Prasad
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">9912179771</span>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <span>Instant sign in</span>
                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            {/* Rajesh Customer Demo Button */}
            <button
              type="button"
              onClick={() => handleOneClickDemo('CUSTOMER')}
              className="p-2.5 rounded-xl bg-[#131929] border border-blue-500/30 hover:border-blue-400 hover:bg-[#182136] text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 group-hover:text-blue-200">
                  👤 Rajesh
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  Customer
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">8888888888</span>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <span>Instant sign in</span>
                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Security & Footer Info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {language === 'te'
                ? 'శ్రీ పెంచల లక్ష్మీనరసింహ స్వామి సిమెంట్ వర్క్స్ • సురక్షిత లాగిన్'
                : 'Sri Penchila LakshmiNarasimha Swamy Cement Work • Secure Portal'}
            </span>
          </p>
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
