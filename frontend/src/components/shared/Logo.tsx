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
      title: 'text-base sm:text-lg',
      sub: 'text-[9px]',
    },
    md: {
      img: 'w-10 h-10',
      title: 'text-lg sm:text-xl',
      sub: 'text-[10px]',
    },
    lg: {
      img: 'w-14 h-14',
      title: 'text-2xl',
      sub: 'text-xs',
    },
    xl: {
      img: 'w-20 h-20',
      title: 'text-3xl',
      sub: 'text-sm',
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div
        className={`${sizeClasses.img} relative rounded-xl overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10 bg-slate-900 shrink-0 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300`}
      >
        <Image
          src="/images/logo.png"
          alt="Prasad Cement Products Logo"
          fill
          priority
          sizes="(max-width: 768px) 48px, 64px"
          className="object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black ${sizeClasses.title} tracking-tight text-white group-hover:text-amber-400 transition-colors leading-none`}
          >
            {language === 'te' ? (
              <>
                ప్రసాద్ <span className="text-amber-500">సిమెంట్</span>
              </>
            ) : (
              <>
                PRASAD <span className="text-amber-500">CEMENT</span>
              </>
            )}
          </span>
          <span
            className={`${sizeClasses.sub} text-slate-400 font-semibold tracking-wider uppercase mt-1 leading-none`}
          >
            {language === 'te' ? 'ప్రీకాస్ట్ ప్రొడక్ట్స్' : 'Precast Concrete Works'}
          </span>
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
