'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
import GoogleAuthModal, { GoogleAccountData } from '@/components/auth/GoogleAuthModal';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, loginWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // ─── Cinematic Logo Zoom Intro State ─────────────────────────────────────────
  const [introPhase, setIntroPhase] = useState<'zooming' | 'exit' | 'done'>('zooming');

  useEffect(() => {
    // Phase 1: trigger smooth exit zoom after 2.1s
    const timer1 = setTimeout(() => {
      setIntroPhase('exit');
    }, 2100);

    // Phase 2: complete splash transition & reveal login details
    const timer2 = setTimeout(() => {
      setIntroPhase('done');
    }, 2700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSkipIntro = () => {
    setIntroPhase('done');
  };

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
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
          ? 'దయచేసి మీ మొబైల్ నంబర్ లేదా ఇమెయిల్ నమోదు చేయండి'
          : 'Please enter your mobile number or email address'
      );
      return;
    }

    if (!raw.includes('@')) {
      const cleanPhone = raw.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        setError(
          language === 'te'
            ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి'
            : 'Please enter a valid 10-digit mobile number'
        );
        return;
      }
    }

    if (!password) {
      setError(
        language === 'te'
          ? 'దయచేసి మీ పాస్‌వర్డ్ నమోదు చేయండి'
          : 'Please enter your account password'
      );
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(raw, password);
      setSocialNotification(
        language === 'te'
          ? 'విజయవంతంగా లాగిన్ అయ్యారు!'
          : `Welcome back, ${loggedUser.name || 'valued customer'}!`
      );
      setTimeout(() => {
        if (loggedUser.role === 'ADMIN' && redirectUrl === '/') {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
      }, 500);
    } catch (err: any) {
      setError(
        err.message ||
          (language === 'te'
            ? 'లాగిన్ విఫలమైంది. దయచేసి సరైన వివరాలు ఇవ్వండి.'
            : 'Login failed. Please check your credentials.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Direct Google Login ───────────────────────────────────────────────────
  const handleDirectGoogleLogin = () => {
    setError('');
    setShowGoogleModal(true);
  };

  const handleProcessGoogleAuth = async (accountData: GoogleAccountData) => {
    setError('');
    setIsGoogleLoading(true);
    setSocialNotification(
      language === 'te'
        ? `${accountData.name} గూగుల్ ఖాతాతో లాగిన్ అవుతున్నారు...`
        : `Connecting with Google account (${accountData.email})...`
    );

    try {
      const user = await loginWithGoogle(accountData);

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

  // ─── Direct Google Login ───

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-10 bg-[#0a0d14] overflow-hidden">
      {/* ─── FULLSCREEN LOGO ZOOM INTRO ANIMATION ─────────────────────────────── */}
      {introPhase !== 'done' && (
        <div
          onClick={handleSkipIntro}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] cursor-pointer transition-all duration-700 ease-out select-none ${
            introPhase === 'exit'
              ? 'opacity-0 scale-125 pointer-events-none'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* Ambient Lighting Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/25 via-amber-600/10 to-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,11,20,0.85)_100%)]"></div>

          {/* Glowing Animated Outer Pulse Rings */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="relative flex items-center justify-center mb-8">
              {/* Outer Decorative Glow Rings */}
              <div
                className={`absolute rounded-3xl border border-amber-500/30 transition-all duration-1000 ease-out ${
                  introPhase === 'zooming'
                    ? 'w-44 h-44 sm:w-56 sm:h-56 opacity-100 scale-110'
                    : 'w-24 h-24 opacity-0 scale-75'
                }`}
              ></div>
              <div
                className={`absolute rounded-3xl border border-amber-400/20 transition-all duration-1000 delay-150 ease-out ${
                  introPhase === 'zooming'
                    ? 'w-52 h-52 sm:w-64 sm:h-64 opacity-80 scale-110'
                    : 'w-20 h-20 opacity-0 scale-50'
                }`}
              ></div>

              {/* The Zooming Logo Badge */}
              <div
                className={`relative rounded-3xl p-1.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_80px_rgba(245,158,11,0.5)] ${
                  introPhase === 'zooming'
                    ? 'animate-logo-zoom'
                    : 'scale-150 opacity-0 transition-all duration-700'
                }`}
              >
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-[22px] overflow-hidden bg-slate-950 border-2 border-amber-300">
                  <Image
                    src="/images/logo.png"
                    alt="Sri Lakshmi Penchila Narasimha Swamy Cement Work"
                    fill
                    priority
                    sizes="(max-width: 768px) 128px, 176px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* App Name & Typography Entrance */}
            <div
              className={`space-y-3 ${
                introPhase === 'zooming' ? 'animate-reveal-up' : 'opacity-0'
              }`}
            >
              {/* Sacred Telugu Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-bold tracking-wider shadow-lg shadow-amber-500/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>శ్రీ లక్ష్మీ పెంచల నరసింహ స్వామి సిమెంట్ వర్క్స్</span>
              </div>

              {/* Official English App Name */}
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-xl drop-shadow-md">
                Sri Lakshmi Penchila Narasimha Swamy{' '}
                <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent font-black mt-1">
                  Cement Work
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
                Quality Precast Concrete Windows, Bricks, Gagulu & Modular Pools
              </p>
            </div>

            {/* Animated Loading Bar */}
            <div
              className={`w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full mt-8 overflow-hidden transition-all duration-700 delay-300 ${
                introPhase === 'zooming' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 animate-pulse rounded-full w-full"></div>
            </div>

            {/* Skip hint */}
            <button
              type="button"
              onClick={handleSkipIntro}
              className="mt-6 text-[11px] font-semibold text-slate-500 hover:text-amber-400 tracking-wider uppercase transition-colors"
            >
              {language === 'te' ? 'నేరుగా లాగిన్‌కి వెళ్లండి →' : 'Click anywhere to open login →'}
            </button>
          </div>
        </div>
      )}

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
            alt="Sri Lakshmi Penchila Narasimha Swamy Cement Work Logo Watermark"
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

      {/* ─── MAIN LOGIN CONTAINER (Revealed Smoothly After Zoom) ─────────────── */}
      <div
        className={`relative z-10 w-full max-w-[420px] space-y-5 transition-all duration-700 ease-out ${
          introPhase === 'done' || introPhase === 'exit'
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
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
                  alt="Sri Lakshmi Penchila Narasimha Swamy Logo"
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
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">OR QUICK SIGN IN</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* ─── Prominent Secure Google Authentication ─── */}
          <button
            type="button"
            onClick={handleDirectGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-3 transition-all font-semibold text-sm text-white shadow-lg group cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" viewBox="0 0 24 24">
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
            <span>
              {language === 'te' ? 'గూగుల్ ఖాతాతో కొనసాగించండి (Google Login)' : 'Continue with Google'}
            </span>
          </button>

          {/* New Customer Account Creation Link */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              <span>{language === 'te' ? 'కొత్త కస్టమరా? ' : 'New to Prasad Cement? '}</span>
              <Link
                href="/register"
                className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors ml-1 inline-flex items-center gap-1"
              >
                <span>{language === 'te' ? 'కొత్త ఖాతా సృష్టించండి' : 'Create Customer Account'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Footer Info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {language === 'te'
                ? 'శ్రీ లక్ష్మీ పెంచల నరసింహ స్వామి సిమెంట్ వర్క్స్ • సురక్షిత లాగిన్'
                : 'Sri Lakshmi Penchila Narasimha Swamy Cement Work • Secure Portal'}
            </span>
          </p>
        </div>
      </div>

      {/* Real-Time Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleProcessGoogleAuth}
        title="Sign in with Google"
      />
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
