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
      className="pointer-events-none select-none absolute top-[50%] left-0 right-0 -translate-y-1/2 z-0 overflow-hidden flex items-center justify-center min-h-[600px]"
    >
      {/* ─── Real-Time Ambient Light Rays & Backing Glow in Middle of Page ────────────────────────── */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-600/5 to-cyan-600/5 blur-3xl opacity-70 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
        }}
      />

      {/* ─── Center Real-Time Animated Logo in Circular Frame ───────────────────────── */}
      <div
        className="relative flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
        }}
      >
        {/* Outer Circular Orbit Ring with Dashed Accents */}
        <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_60s_linear_infinite]" />

        {/* Inner Counter-rotating Circle */}
        <div className="absolute w-[310px] h-[310px] sm:w-[440px] sm:h-[440px] rounded-full border border-amber-400/15 animate-[spin_40s_linear_infinite_reverse]" />

        {/* Circular Emblem Frame Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border-2 border-amber-500/30 p-4 bg-slate-950/30 backdrop-blur-[2px] shadow-2xl shadow-amber-500/10 opacity-[0.18] sm:opacity-[0.22] animate-float-pulse flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="PRASAD CEMENT WORK Circular Background Watermark"
              fill
              priority
              sizes="(max-width: 768px) 256px, 384px"
              className="object-cover rounded-full filter contrast-125 transition-all duration-1000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
