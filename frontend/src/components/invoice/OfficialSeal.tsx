'use client';

import React from 'react';

interface OfficialSealProps {
  size?: number;
  className?: string;
  watermark?: boolean;
  opacity?: number;
  rotation?: number;
}

export default function OfficialSeal({
  size = 180,
  className = '',
  watermark = false,
  opacity = 1,
  rotation = -4,
}: OfficialSealProps) {
  // Vivid official stamp blue matching Indian enterprise rubber stamps
  const sealColor = watermark ? '#1e40af' : '#0022f4';

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        opacity: watermark ? 0.09 : opacity,
      }}
      aria-label="Official Prasad Cement Work Company Seal"
    >
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer Top Arch for Company Name (Clockwise) */}
          <path
            id="seal-outer-top-path"
            d="M 46 200 A 154 154 0 1 1 354 200"
            fill="none"
          />

          {/* Inner Top Arch for Prasad Cement Products (Clockwise) */}
          <path
            id="seal-inner-top-path"
            d="M 85 200 A 115 115 0 1 1 315 200"
            fill="none"
          />

          {/* Inner Bottom Arch for City (Clockwise from bottom left to bottom right) */}
          <path
            id="seal-inner-bottom-path"
            d="M 92 225 A 115 115 0 0 0 308 225"
            fill="none"
          />

          {/* Outer Bottom Arch for State / Pincode */}
          <path
            id="seal-outer-bottom-path"
            d="M 52 225 A 154 154 0 0 0 348 225"
            fill="none"
          />
        </defs>

        {/* ─── Outer Double Rings ─── */}
        {/* Outermost thick circle */}
        <circle
          cx="200"
          cy="200"
          r="192"
          fill="none"
          stroke={sealColor}
          strokeWidth="7"
        />

        {/* Outer secondary concentric thin circle */}
        <circle
          cx="200"
          cy="200"
          r="181"
          fill="none"
          stroke={sealColor}
          strokeWidth="2.5"
        />

        {/* Inner concentric ring separating outer text */}
        <circle
          cx="200"
          cy="200"
          r="134"
          fill="none"
          stroke={sealColor}
          strokeWidth="3.5"
        />

        {/* ─── Center Core & Text ─── */}
        {/* Central bold "SEAL" */}
        <text
          x="200"
          y="198"
          textAnchor="middle"
          fill={sealColor}
          fontSize="44"
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
          letterSpacing="4"
        >
          SEAL
        </text>

        {/* Center year "2020" */}
        <text
          x="200"
          y="238"
          textAnchor="middle"
          fill={sealColor}
          fontSize="30"
          fontWeight="800"
          fontFamily="Arial Black, sans-serif"
          letterSpacing="2"
        >
          2020
        </text>

        {/* ─── Outer Arched Text: COMPANY NAME ─── */}
        <text
          fill={sealColor}
          fontSize="18.5"
          fontWeight="900"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="2.8"
        >
          <textPath
            href="#seal-outer-top-path"
            startOffset="50%"
            textAnchor="middle"
          >
            ★ SRI LAKSHMI PENCHILA NARASIMHA SWAMY ★
          </textPath>
        </text>

        {/* ─── Inner Arched Text: COMPANY TYPE ─── */}
        <text
          fill={sealColor}
          fontSize="21"
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
          letterSpacing="3"
        >
          <textPath
            href="#seal-inner-top-path"
            startOffset="50%"
            textAnchor="middle"
          >
            PRASAD CEMENT WORKS
          </textPath>
        </text>

        {/* ─── Inner Bottom Arched Text: CITY NAME ─── */}
        <text
          fill={sealColor}
          fontSize="23"
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
          letterSpacing="3.5"
        >
          <textPath
            href="#seal-inner-bottom-path"
            startOffset="50%"
            textAnchor="middle"
          >
            VELAGATOOR
          </textPath>
        </text>

        {/* ─── Outer Bottom Arched Text: STATE NAME ─── */}
        <text
          fill={sealColor}
          fontSize="20"
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
          letterSpacing="4"
        >
          <textPath
            href="#seal-outer-bottom-path"
            startOffset="50%"
            textAnchor="middle"
          >
            TELANGANA - 505526
          </textPath>
        </text>
      </svg>
    </div>
  );
}
