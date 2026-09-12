'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AmbientLogoBackground() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offset (-15 to 15 pixels) for subtle real-time parallax
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* ─── Real-Time Ambient Light Rays & Backing Glow ────────────────────────── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-600/5 to-cyan-600/5 blur-3xl opacity-75 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(calc(-50% + ${mousePos.x * 0.5}px), calc(-50% + ${mousePos.y * 0.5}px))`,
        }}
      />

      {/* ─── Center Hero Real-Time Animated Logo Watermark ───────────────────────── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))`,
        }}
      >
        {/* Outer Orbiting Sacred Ring */}
        <div className="absolute w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] rounded-full border border-amber-500/10 animate-[spin_60s_linear_infinite]" />

        {/* Counter-rotating Geometric Octagon Accent Ring */}
        <div className="absolute w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-[60px] border border-amber-400/5 animate-[spin_45s_linear_infinite_reverse]" />

        {/* Floating, Breathing Real-Time Center Logo Watermark */}
        <div className="relative w-72 h-72 sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px] opacity-[0.14] sm:opacity-[0.17] animate-float-pulse">
          <Image
            src="/images/logo.png"
            alt="Sri Penchila LakshmiNarasimha Swamy Cement Work Watermark"
            fill
            priority
            sizes="(max-width: 768px) 288px, 520px"
            className="object-contain filter contrast-125 transition-all duration-1000"
          />
        </div>
      </div>
    </div>
  );
}
