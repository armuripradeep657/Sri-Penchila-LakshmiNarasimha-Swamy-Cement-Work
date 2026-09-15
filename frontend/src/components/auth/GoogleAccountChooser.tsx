'use client';

import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { GoogleAuthResult } from '@/lib/firebase';

interface GoogleAccountChooserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAuthResult) => void;
}

export default function GoogleAccountChooser({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleAccountChooserProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectOwner = () => {
    onSelectAccount({
      email: 'armuriprasad@gmail.com',
      name: 'Prasad Armuri',
      uid: 'google_armuriprasad',
      photoURL: undefined,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }

    const name = customName.trim() || cleanEmail.split('@')[0];
    onSelectAccount({
      email: cleanEmail,
      name,
      uid: `google_${Date.now()}`,
      photoURL: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-white shadow-md mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>

          <h3 className="text-xl font-extrabold text-white">Choose an account</h3>
          <p className="text-xs text-slate-400">
            to continue to <span className="font-semibold text-amber-400">Prasad Cement Products</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {!showCustomInput ? (
          <div className="space-y-3">
            {/* Owner Account Option */}
            <button
              onClick={handleSelectOwner}
              className="w-full p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                P
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                    Prasad Armuri
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                    Owner
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">armuriprasad@gmail.com</p>
              </div>
            </button>

            {/* Use Another Account Button */}
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3.5 transition-all text-left cursor-pointer text-slate-300 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Use another Google account</span>
            </button>
          </div>
        ) : (
          /* Custom Google Account Input Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Google Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Your Full Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Reddy"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>To continue, Google will share your name and email with Prasad Cement.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
