'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PWARegister() {
  const { language } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as installed standalone PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('PWA Service Worker registered'))
        .catch((err) => console.warn('SW notice:', err));
    }

    // Capture beforeinstallprompt event for 1-click native install
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Auto-show prompt notification
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show install notification on visit if not previously dismissed in this session
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('pcp_pwa_notification_dismissed');
      if (!dismissed) {
        setShowPopup(true);
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDirectInstall = async () => {
    setIsInstalling(true);

    if (installPrompt) {
      try {
        // Trigger browser's native direct installation prompt without menu navigation
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalledSuccess(true);
          setTimeout(() => setShowPopup(false), 2000);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setInstallPrompt(null);
        setIsInstalling(false);
      }
    } else {
      // For iOS Safari or browsers where beforeinstallprompt was already captured
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIOS) {
        alert(
          language === 'te'
            ? 'యాప్ ఇన్‌స్టాల్ చేయడానికి: సఫారీ క్రింద "Share" ఐకాన్ నొక్కి, "Add to Home Screen" ఎంచుకోండి.'
            : 'To install on iPhone/iPad: Tap the Share button at the bottom of Safari and select "Add to Home Screen".'
        );
      } else {
        alert(
          language === 'te'
            ? 'మీ బ్రౌజర్ మెనూ ద్వారా "Install App" క్లిక్ చేయండి.'
            : 'Click the install icon in your browser address bar or menu to install.'
        );
      }
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    try {
      sessionStorage.setItem('pcp_pwa_notification_dismissed', 'true');
    } catch {}
  };

  if (isStandalone || !showPopup) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 px-4 flex justify-center pointer-events-none animate-in slide-in-from-bottom-6 duration-300">
      <div className="pointer-events-auto w-full max-w-lg rounded-3xl bg-slate-900/98 backdrop-blur-2xl border-2 border-amber-500/60 shadow-2xl shadow-black/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
        {/* App Icon */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-950 shrink-0 shadow-lg shadow-amber-500/20">
          <Image
            src="/icon-192.png"
            alt="Prasad Cement Products App Icon"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-3 h-3 text-amber-400" />
              {language === 'te' ? 'నేరుగా ఇన్‌స్టాల్ చేయండి' : 'Direct 1-Click Install'}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate">
            {language === 'te' ? 'ప్రసాద్ సిమెంట్ ప్రొడక్ట్స్ యాప్' : 'Prasad Cement Products App'}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
            {language === 'te'
              ? 'మొబైల్ & డెస్క్‌టాప్‌లో వేగవంతమైన ఆర్డరింగ్ & ప్రత్యక్ష ట్రాకింగ్'
              : 'Install directly to Mobile & Desktop for instant ordering & live dispatch tracking'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={handleDirectInstall}
            disabled={isInstalling || installedSuccess}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
          >
            {installedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Installed!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{language === 'te' ? 'ఇన్‌స్టాల్ చేయండి' : 'Install App'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
