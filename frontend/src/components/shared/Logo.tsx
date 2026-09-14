'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
}: LogoProps) {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: {
      img: 'w-8 h-8',
      title: 'text-xs sm:text-sm font-bold',
      sub: 'text-[9px]',
    },
    md: {
      img: 'w-10 h-10 sm:w-11 sm:h-11',
      title: 'text-xs sm:text-sm font-black',
      sub: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      img: 'w-16 h-16',
      title: 'text-lg sm:text-xl font-black',
      sub: 'text-xs',
    },
    xl: {
      img: 'w-24 h-24',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-sm',
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div
        className={`${sizeClasses.img} relative rounded-xl overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-slate-900 shrink-0 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 ring-2 ring-amber-500/20`}
      >
        <Image
          src="/images/logo.png"
          alt="Sri Lakshmi Penchila Narasimha Swamy Cement Work Logo"
          fill
          priority
          sizes="(max-width: 768px) 48px, 96px"
          className="object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <span
            className={`${sizeClasses.title} tracking-tight text-white group-hover:text-amber-400 transition-colors leading-tight truncate max-w-[130px] min-[380px]:max-w-[180px] sm:max-w-none`}
          >
            {language === 'te' ? (
              <>శ్రీ లక్ష్మీ పెంచల నరసింహ స్వామి</>
            ) : (
              <>Sri Lakshmi Penchila</>
            )}
            <span className="hidden min-[380px]:inline">
              {language === 'te' ? '' : ' Narasimha Swamy'}
            </span>
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`${sizeClasses.sub} text-amber-400 font-extrabold tracking-wider uppercase leading-none truncate`}
            >
              {language === 'te' ? 'ప్రసాద్ సిమెంట్ వర్క్' : 'PRASAD CEMENT WORK'}
            </span>
            <span className="text-slate-600 text-[9px] leading-none hidden sm:inline">•</span>
            <span
              className={`${sizeClasses.sub} text-slate-400 font-semibold tracking-wider uppercase leading-none hidden sm:inline`}
            >
              {language === 'te' ? 'ప్రీకాస్ట్ సొల్యూషన్స్' : 'Precast Concrete'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
