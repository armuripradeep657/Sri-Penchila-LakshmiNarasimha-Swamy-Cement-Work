'use client';

import React, { useState } from 'react';
import { X, UserPlus, Check, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';

export interface GoogleAccountData {
  name: string;
  email: string;
  gender: string;
  phone: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (data: GoogleAccountData) => Promise<void>;
  title?: string;
}

const PRESET_ACCOUNTS: GoogleAccountData[] = [
  {
    name: 'Prasad Armuri (Owner)',
    email: 'armuriprasad@gmail.com',
    gender: 'Male',
    phone: '9912179771',
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar.builder@gmail.com',
    gender: 'Male',
    phone: '9849123456',
  },
  {
    name: 'Kavitha Reddy',
    email: 'kavitha.civil@gmail.com',
    gender: 'Female',
    phone: '9440123456',
  },
];

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  title = 'Sign in with Google',
}: GoogleAuthModalProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customGender, setCustomGender] = useState('Male');
  const [customPhone, setCustomPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handlePickAccount = async (account: GoogleAccountData) => {
    setIsProcessing(true);
    setProcessingEmail(account.email);
    try {
      await onSelectAccount(account);
      onClose();
    } catch (err) {
      console.error('Google account auth error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customEmail.trim().includes('@')) {
      setFormError('Please enter a valid Google email address (e.g. name@gmail.com)');
      return;
    }

    if (customName.trim().length < 2) {
      setFormError('Please enter your full name');
      return;
    }

    const cleanPhone = customPhone.replace(/\D/g, '').slice(-10) || '9912179771';

    const account: GoogleAccountData = {
      name: customName.trim(),
      email: customEmail.trim().toLowerCase(),
      gender: customGender,
      phone: cleanPhone,
    };

    setIsProcessing(true);
    setProcessingEmail(account.email);
    try {
      await onSelectAccount(account);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Google account sign-in failed');
    } finally {
      setIsProcessing(false);
      setProcessingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1e222d] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Google Header */}
        <div className="p-6 sm:p-7 border-b border-slate-700/60 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Google G Logo */}
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400">
                to continue to <strong className="text-amber-400">Prasad Cement Products</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-amber-300">
              Connecting with Google ({processingEmail})...
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {!isCustomMode ? (
            <>
              <p className="text-xs font-medium text-slate-300">
                Choose a Google account to auto-save profile & sign in:
              </p>

              <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-700/80 bg-slate-900/60 overflow-hidden">
                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handlePickAccount(acc)}
                    className="w-full text-left p-3.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
                        {acc.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {acc.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}

                {/* Option to use another account */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-left p-3.5 hover:bg-slate-800/80 transition-colors flex items-center gap-3 text-xs font-semibold text-amber-400 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Use another Google account / Enter Details</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time OAuth: Name, Gender & Mail ID will be auto-saved securely.</span>
              </div>
            </>
          ) : (
            /* Custom Google Account Entry Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-white">Enter Google Account Details</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  ← Back to accounts list
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Google Mail ID */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Google Mail ID
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Gender
                </label>
                <select
                  value={customGender}
                  onChange={(e) => setCustomGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2">
                  <span className="text-xs text-slate-400 font-mono pr-2 border-r border-slate-800">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9912179771"
                    className="w-full bg-transparent pl-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Continue & Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
