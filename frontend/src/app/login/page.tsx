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
  Sparkles,
  Layers,
  User as UserIcon,
  Building,
  CheckCircle2,
  RotateCw,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const { language, t } = useLanguage();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('9912179771');
  const [email, setEmail] = useState('prasad.owner@cementproducts.com');
  const [name, setName] = useState('Prasad Rao (Owner)');
  const [firmName, setFirmName] = useState('Prasad Cement Products Industries');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError(language === 'te' ? 'దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(cleanPhone, email || undefined);
      const generatedOtp = res?.devOtp || (res as any)?.code || '';
      if (generatedOtp) {
        setDevOtpHint(generatedOtp);
        setOtp(generatedOtp);
      }
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'ధృవీకరణ కోడ్ పంపడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Failed to send verification code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError(language === 'te' ? 'ధృవీకరణ కోడ్ 6 అంకెలు ఉండాలి' : 'Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const user = await login(
        cleanPhone,
        otp,
        name || undefined,
        email || undefined,
        firmName || undefined
      );

      if (user?.role === 'ADMIN' && redirectUrl === '/') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'ధృవీకరణ విఫలమైంది. దయచేసి మీ OTP కోడ్‌ని తనిఖీ చేయండి.' : 'Verification failed. Please check your OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (
    testPhone: string,
    testEmail: string,
    testName: string,
    testFirm: string
  ) => {
    setPhone(testPhone);
    setEmail(testEmail);
    setName(testName);
    setFirmName(testFirm);
    setStep('PHONE');
    setOtp('');
    setDevOtpHint('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/25">
            <Layers className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('login_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {t('login_subtitle')}
          </p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5 text-xs shadow-lg">
          <div className="flex items-center justify-between">
            <p className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {t('fast_sign_in')}
            </p>
            <span className="text-[10px] text-slate-500">{t('auto_fills_phone')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                quickFill(
                  '9912179771',
                  'prasad.owner@cementproducts.com',
                  'Prasad Rao (Owner)',
                  'Prasad Cement Products Industries'
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-500 text-left transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">{t('role_prasad')}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">{t('role_owner')}</span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono block mt-1">9912179771</span>
              <span className="text-[10px] text-slate-400 truncate block">prasad.owner@cementproducts.com</span>
            </button>

            <button
              type="button"
              onClick={() =>
                quickFill(
                  '8888888888',
                  'rajesh.contractor@gmail.com',
                  'Rajesh Kumar (Contractor)',
                  'Sri Rama Constructions'
                )
              }
              className="p-3 rounded-xl bg-slate-950 border border-blue-500/40 hover:border-blue-500 text-left transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300">{t('role_rajesh')}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">{t('role_builder')}</span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono block mt-1">8888888888</span>
              <span className="text-[10px] text-slate-400 truncate block">rajesh.contractor@gmail.com</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 bg-slate-900/70 shadow-2xl">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>{t('field_mobile')} *</span>
                  <span className="text-[10px] text-amber-400">{t('field_mobile_hint')}</span>
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
                    placeholder="9999999999"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 tracking-wider"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>{t('field_email')} *</span>
                  <span className="text-[10px] text-slate-500">{t('field_email_hint')}</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t('field_full_name')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prasad Rao"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Company / Firm Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t('field_firm_name')}
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="e.g. Sri Rama Constructions"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? '...' : t('btn_send_otp')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {t('enter_6_digit_otp')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('PHONE');
                      setOtp('');
                      setDevOtpHint('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {t('btn_edit_phone_email')}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <p className="text-slate-400">
                    Mobile: <span className="text-white font-mono font-semibold">+91 {phone}</span>
                  </p>
                  {email && (
                    <p className="text-slate-400">
                      Email: <span className="text-amber-400 font-medium">{email}</span>
                    </p>
                  )}
                </div>

                {/* Dynamic SMS OTP Simulator Card */}
                {devOtpHint && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        {t('simulated_sms_alert')}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        {t('random_code_badge')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">{t('your_otp_code')}</span>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1">
                          {devOtpHint.split('').map((digit, idx) => (
                            <span
                              key={idx}
                              className="w-7 h-8 sm:w-8 sm:h-9 rounded-lg bg-slate-950 border border-amber-500/60 flex items-center justify-center text-base sm:text-lg font-mono font-extrabold text-amber-300 shadow-sm"
                            >
                              {digit}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setOtp(devOtpHint);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          }}
                          className="flex items-center gap-1 text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg transition shadow"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Filled' : t('btn_auto_fill')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{t('expires_in_5m')}</span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{t('btn_generate_different_otp')}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative mt-2">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? '...' : t('btn_verify_enter')}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{t('btn_resend_different_otp')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('PHONE');
                    setOtp('');
                    setDevOtpHint('');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {t('btn_change_mobile')}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted Session • Instant Precast Yard Access</span>
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
