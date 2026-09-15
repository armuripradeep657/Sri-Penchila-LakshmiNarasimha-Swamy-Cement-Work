'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Layers,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Building,
  LogIn,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/shared/Logo';
import { signInWithGoogleRealtime } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const { language } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('Velagatoor');
  const [firmName, setFirmName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogleRealtime();
      await loginWithGoogle({
        email: googleUser.email,
        name: googleUser.name,
        phone: googleUser.phone,
        avatarUrl: googleUser.photoURL,
      });
      router.push('/');
    } catch (err: any) {
      if (err.message?.includes('cancelled') || err.message?.includes('closed')) {
        // user closed popup
      } else {
        setError(err.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError(language === 'te' ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (name.trim().length < 2) {
      setError(language === 'te' ? 'పేరు కనీసం 2 అక్షరాలు ఉండాలి' : 'Name must be at least 2 characters');
      return;
    }

    if (password.length < 6) {
      setError(language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలలేదు' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        phone: cleanPhone,
        password,
        name: name.trim(),
        email: email.trim() || undefined,
        village: village.trim() || 'Velagatoor',
        firmName: firmName.trim() || undefined,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'రిజిస్ట్రేషన్ విఫలమైంది' : 'Registration failed. Please try again.'));
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
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">
              {language === 'te'
                ? 'శ్రీ లక్ష్మీ పెంచల నరసింహ స్వామి సిమెంట్ వర్క్స్'
                : 'Sri Lakshmi Penchila Narasimha Swamy'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'te' ? 'కొత్త ఖాతా సృష్టించండి' : 'Create Account'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {language === 'te'
              ? 'హోల్‌సేల్ ధరలు, ఆర్డర్ ట్రాకింగ్ మరియు కస్టమ్ కొటేషన్ల కొరకు రిజిస్టర్ అవ్వండి.'
              : 'Register to access wholesale prices, order tracking, and custom quotes.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Register Form */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-slate-900/70 shadow-2xl">
          {/* Quick Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#141926] hover:bg-[#1a2133] border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-3 transition-all font-semibold text-sm text-white shadow-lg group cursor-pointer mb-5"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-500 border-t-emerald-400 rounded-full animate-spin"></div>
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
              {language === 'te' ? 'గూగుల్ ఖాతాతో సులభంగా రిజిస్టర్ అవ్వండి' : 'Sign up with Google (1-Click)'}
            </span>
          </button>

          {/* OR Divider */}
          <div className="flex items-center mb-5 gap-3">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">
              {language === 'te' ? 'లేదా మొబైల్ నంబర్‌తో' : 'OR WITH MOBILE & PASSWORD'}
            </span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'te' ? 'పూర్తి పేరు' : 'Full Name'} *</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: రాజేష్ కుమార్' : 'e.g. Rajesh Kumar'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'} *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 tracking-wider"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'te' ? 'ఇమెయిల్' : 'Email'}
                </span>
                <span className="text-[10px] text-slate-500 normal-case font-normal">
                  {language === 'te' ? 'ఐచ్ఛికం' : 'Optional'}
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Village / Town (Required for Delivery & Owner Directory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'te' ? 'గ్రామం / మండలం' : 'Village / Town / Mandal'} *
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  {language === 'te' ? 'డెలివరీ కోసం' : 'Site Delivery'}
                </span>
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: వెలగటూర్, కిషన్‌రావుపేట్, చెగ్గం, ధర్మపురి' : 'e.g. Velagatoor, Kishanraopet, Cheggam, Dharmapuri'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Firm Name (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'te' ? 'సంస్థ / కాంట్రాక్టర్ పేరు' : 'Contractor / Firm Name'}
                </span>
                <span className="text-[10px] text-slate-500 normal-case font-normal">
                  {language === 'te' ? 'ఐచ్ఛికం' : 'Optional'}
                </span>
              </label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: శ్రీ రామ కన్‌స్ట్రక్షన్స్' : 'e.g. Sri Rama Constructions'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'te' ? 'పాస్‌వర్డ్' : 'Password'} *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'te' ? 'కనీసం 6 అక్షరాలు' : 'Minimum 6 characters'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'te' ? 'పాస్‌వర్డ్ నిర్ధారించండి' : 'Confirm Password'} *</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'te' ? 'పాస్‌వర్డ్ మళ్ళీ టైప్ చేయండి' : 'Re-type your password'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? '...' : (language === 'te' ? 'ఖాతా సృష్టించండి' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-3">
              {language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా?' : 'Already have an account?'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-950 border border-amber-500/40 hover:border-amber-500 text-amber-400 hover:text-amber-300 transition-all hover:scale-[1.02] shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In Instead'}</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{language === 'te' ? 'మీ సమాచారం సురక్షితంగా ఉంటుంది' : 'Your data is securely encrypted'}</span>
        </div>
      </div>
    </div>
  );
}
