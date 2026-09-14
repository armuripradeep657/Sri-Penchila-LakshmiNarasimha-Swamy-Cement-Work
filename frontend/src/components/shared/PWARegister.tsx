'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PWARegister() {
  const { language } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running in standalone mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check if user dismissed recently
      const lastDismissed = localStorage.getItem('pcp_pwa_dismissed');
      if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 3600 * 1000) {
        setDismissed(true);
      }

      // Check for iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // 2. Register Service Worker
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => console.log('PWA Service Worker registered'))
          .catch((err) => console.warn('SW registration notice:', err));
      }

      // 3. Listen for browser install prompt (Android/Chrome/Edge/Desktop)
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('pcp_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  // Don't show if already in standalone app mode or dismissed or not installable
  if (isStandalone || dismissed) return null;

  return (
    <>
      {/* ─── Android / Desktop Chrome Install Banner ─── */}
      {isInstallable && (
        <aside
          aria-label="Install App Banner"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-24 z-50 max-w-sm rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 shrink-0 shadow-md">
              <Image
                src="/icon-192.png"
                alt="Prasad Cement App Icon"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">
                {language === 'te' ? 'యాప్‌ను ఇన్‌స్టాల్ చేసుకోండి' : 'Install Prasad Cement App'}
              </p>
              <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                {language === 'te' ? 'వేగవంతమైన ఆర్డరింగ్ & నోటిఫికేషన్లు' : 'Instant mobile access & orders'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ఇన్‌స్టాల్' : 'Install'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ─── iOS Safari Install Tip (Only shown on iPhone Safari if not in standalone) ─── */}
      {isIOS && !isStandalone && (
        <aside
          aria-label="iOS Add to Home Screen"
          className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3 shadow-xl flex items-center justify-between gap-2.5 text-xs text-slate-300 md:hidden"
        >
          <div className="flex items-center gap-2">
            <Share className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] leading-snug">
              Install as App: Tap <span className="font-bold text-white">Share</span> then select{' '}
              <span className="font-bold text-amber-400">&apos;Add to Home Screen&apos;</span>.
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}
    </>
  );
}
