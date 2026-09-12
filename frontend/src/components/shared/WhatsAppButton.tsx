'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WhatsAppButtonProps {
  productName?: string;
}

export default function WhatsAppButton({ productName }: WhatsAppButtonProps) {
  const { language } = useLanguage();

  // Destination owner phone: 8919526315 (kept strictly in href, never displayed as visible text)
  const ownerPhone = '918919526315';

  const defaultMessage =
    language === 'te'
      ? 'నమస్కారం శ్రీ పెంచల లక్ష్మీనరసింహ స్వామి సిమెంట్ వర్క్స్, నేను మీ ప్రీకాస్ట్ సిమెంట్ ప్రొడక్ట్స్ (కిటికీలు, ఇటుకలు, గగులు) గురించి వివరాలు మరియు ధర తెలుసుకోవాలనుకుంటున్నాను.'
      : 'Hello Sri Penchila LakshmiNarasimha Swamy Cement Work, I would like to inquire about your precast cement products (windows, bricks, gagulu rings).';

  const message = productName
    ? language === 'te'
      ? `నమస్కారం శ్రీ పెంచల లక్ష్మీనరసింహ స్వామి సిమెంట్ వర్క్స్, నేను "${productName}" గురించి ఎంక్వైరీ చేయాలనుకుంటున్నాను. దయచేసి ధర మరియు డెలివరీ వివరాలు పంపగలరు.`
      : `Hello Sri Penchila LakshmiNarasimha Swamy Cement Work, I am interested in inquiring about "${productName}". Could you please provide pricing and delivery timeline?`
    : defaultMessage;

  const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

  return (
    <aside
      aria-label="Direct WhatsApp Chat"
      className="fixed bottom-5 right-5 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white pl-2.5 pr-4 py-2 sm:py-2.5 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.35)] hover:shadow-[0_10px_35px_rgb(16,185,129,0.55)] transition-all duration-300 hover:scale-105 border border-emerald-300/40 backdrop-blur-md"
        title={
          language === 'te'
            ? 'శ్రీ పెంచల లక్ష్మీనరసింహ స్వామి సిమెంట్ వర్క్స్ తో వాట్సాప్ చాట్'
            : 'Chat with Sri Penchila LakshmiNarasimha Swamy Cement Work'
        }
      >
        {/* Brand Logo Avatar with pulsing active ring */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/60 shrink-0 bg-slate-950 shadow-inner">
          <Image
            src="/images/logo.png"
            alt="Sri Penchila LakshmiNarasimha Swamy Cement Work"
            fill
            sizes="32px"
            className="object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full animate-ping" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full" />
        </div>

        {/* WhatsApp Icon */}
        <div className="flex items-center justify-center text-white">
          <MessageCircle className="w-5 h-5 fill-white/20 animate-pulse" />
        </div>

        {/* Company Name Badge — Number is 100% hidden, company name displayed */}
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-100 flex items-center gap-1 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {language === 'te' ? 'యజమానితో చాట్' : 'Direct Chat with Owner'}
          </span>
          <span className="text-xs font-black text-white tracking-tight leading-tight mt-0.5 max-w-[200px] sm:max-w-[280px] truncate">
            {language === 'te'
              ? 'శ్రీ పెంచల లక్ష్మీనరసింహ స్వామి సిమెంట్ వర్క్స్'
              : 'Sri Penchila LakshmiNarasimha Swamy Cement Work'}
          </span>
        </div>
      </a>
    </aside>
  );
}
