'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  Share,
  Star,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PWARegister() {
  const { language } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as installed standalone PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('PWA Service Worker registered'))
        .catch((err) => console.warn('SW registration notice:', err));
    }

    // Capture beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Automatically show install popup after initial page load if not in standalone mode
    if (!isStandaloneMode) {
      const timer = setTimeout(() => {
        const sessionDismissed = sessionStorage.getItem('pcp_install_popup_closed');
        if (!sessionDismissed) {
          setShowPopup(true);
        }
      }, 1400);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setIsInstallable(false);
        setTimeout(() => setShowPopup(false), 2000);
      }
      setInstallPrompt(null);
    } else if (isIOS) {
      alert(
        language === 'te'
          ? 'యాప్‌ను ఇన్‌స్టాల్ చేయడానికి: క్రింద ఉన్న "Share" బటన్ నొక్కి, "Add to Home Screen" ఎంచుకోండి.'
          : 'To Install on iPhone/iPad: Tap the "Share" icon at the bottom of Safari, then choose "Add to Home Screen".'
      );
    } else {
      // Direct instructions for Chromium/Android if event already passed
      alert(
        language === 'te'
          ? 'మీ బ్రౌజర్ మెనూ (3 చుక్కలు) నొక్కి "Install App" లేదా "Add to Home screen" ఎంచుకోండి.'
          : 'Tap your browser menu (3 dots) and select "Install app" or "Add to Home screen".'
      );
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    try {
      sessionStorage.setItem('pcp_install_popup_closed', 'true');
    } catch {}
  };

  if (isStandalone) return null;

  return (
    <>
      {/* ─── Persistent Floating Re-open Button (bottom-right) ─── */}
      {!showPopup && (
        <button
          onClick={() => setShowPopup(true)}
          aria-label="Install App"
          className="fixed bottom-6 right-4 sm:right-6 z-40 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 border border-amber-400/40 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-in fade-in duration-300"
        >
          <Smartphone className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="hidden sm:inline">
            {language === 'te' ? 'యాప్‌ను ఇన్‌స్టాల్ చేయండి' : 'Install App / Play Store'}
          </span>
          <span className="sm:hidden font-black">
            {language === 'te' ? 'యాప్' : 'App'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-950 border border-emerald-400 animate-ping" />
        </button>
      )}

      {/* ─── High-Conversion Install Popup Modal ─── */}
      {showPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-black p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with App Icon */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-slate-950 shrink-0 shadow-lg shadow-amber-500/10">
                <Image
                  src="/icon-192.png"
                  alt="Prasad Cement Products App Icon"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Official App</span>
                </div>
                <h3 className="text-base font-extrabold text-white leading-snug truncate">
                  Prasad Cement Products
                </h3>
                <p className="text-xs text-amber-400 font-semibold truncate">
                  Sri Lakshmi Penchila Swamy Works
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white ml-0.5">4.9</span>
                  </div>
                  <span>•</span>
                  <span>Free (4.2 MB)</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Play Store Ready</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant 1-tap ordering & live delivery tracking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Factory direct pricing on windows, ketikelu & bricks</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Works smoothly in low-connectivity rural yards</span>
              </div>
            </div>

            {installedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application installed successfully!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'te' ? 'ఇప్పుడే యాప్‌ను ఇన్‌స్టాల్ చేయండి' : 'Install App Now (1-Tap)'}</span>
              </button>

              <a
                href="https://play.google.com/store/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186c-.346-.35-.558-.87-.558-1.503V3.317c0-.633.212-1.153.557-1.503zm11.242 11.243l2.457 2.457-11.45 6.467 8.993-8.924zm0-2.114L5.858 2.02l11.45 6.466-2.457 2.457zm1.485 1.057l3.65-2.062c.983-.556.983-1.463 0-2.02l-3.65-2.062-2.115 2.115 2.115 2.029z" />
                </svg>
                <span>Google Play Store (Publish & Download)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                onClick={handleClosePopup}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
              >
                {language === 'te' ? 'వెబ్‌సైట్‌లో కొనసాగండి' : 'Continue on Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
