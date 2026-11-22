import React from 'react';

interface ParkSignalLogoProps {
  variant?: 'full' | 'emblem';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  height?: number | string;
}

/**
 * High-definition, vector-sharp ParkSignal Emblem
 * Features: Aerodynamic Car Silhouette, Center Security Shield, 3 Radar Waves, Dual Wheels, and Rear QR Pixels.
 */
export const ParkSignalEmblemSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <svg
      width={Math.round(size * 1.35)}
      height={size}
      viewBox="0 0 135 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient id="psCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="psWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* ── 3 RADIATING RADAR WAVES ON ROOF ── */}
      {/* Outer Wave */}
      <path
        d="M 28 20 A 42 42 0 0 1 82 20"
        stroke="url(#psWaveGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Middle Wave */}
      <path
        d="M 36 29 A 30 30 0 0 1 74 29"
        stroke="url(#psWaveGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner Wave */}
      <path
        d="M 44 38 A 18 18 0 0 1 66 38"
        stroke="url(#psWaveGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── DISSOLVING QR BLOCKS AT REAR ── */}
      {/* QR Position Finder Outer */}
      <rect x="4" y="38" width="16" height="16" rx="2" fill="none" stroke="url(#psCyanGrad)" strokeWidth="2.5" />
      <rect x="8" y="42" width="8" height="8" rx="1" fill="#00E5FF" />

      {/* Small QR Pixels */}
      <rect x="23" y="38" width="6" height="6" rx="1" fill="#06B6D4" />
      <rect x="4" y="58" width="6" height="6" rx="1" fill="#0284C7" />
      <rect x="13" y="58" width="5" height="5" rx="1" fill="#38BDF8" />
      <rect x="22" y="47" width="5" height="5" rx="1" fill="#00E5FF" />
      <rect x="13" y="66" width="4" height="4" rx="0.8" fill="#06B6D4" />

      {/* ── CAR BODY CONTOUR ── */}
      {/* Aerodynamic Roof, Windshield & Hood */}
      <path
        d="M 24 58 L 36 58 C 40 48 50 45 55 45 C 65 45 74 50 82 58 L 108 64 C 118 67 126 73 128 80 L 102 80 M 80 80 L 46 80 M 24 80 L 16 80 C 12 80 8 76 8 72 L 8 68"
        stroke="url(#psCyanGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Hood & Windshield Sweep */}
      <path
        d="M 40 58 L 54 48 C 66 48 80 54 94 62 L 126 72"
        stroke="url(#psCyanGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── SECURITY SHIELD IN CENTER ── */}
      <g transform="translate(43, 40)">
        <path
          d="M 0 4 Q 12 0 24 4 L 24 16 Q 24 28 12 34 Q 0 28 0 16 Z"
          fill="#0B132B"
          stroke="url(#psWaveGrad)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Inner Shield Check Accent */}
        <path
          d="M 7 17 L 11 21 L 18 13"
          stroke="#00E5FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* ── DUAL WHEELS ── */}
      {/* Rear Wheel */}
      <g transform="translate(35, 80)">
        <circle cx="0" cy="0" r="10" stroke="url(#psCyanGrad)" strokeWidth="4" fill="#0B132B" />
        <circle cx="0" cy="0" r="4" fill="#00E5FF" />
      </g>

      {/* Front Wheel */}
      <g transform="translate(91, 80)">
        <circle cx="0" cy="0" r="10" stroke="url(#psCyanGrad)" strokeWidth="4" fill="#0B132B" />
        <circle cx="0" cy="0" r="4" fill="#00E5FF" />
      </g>
    </svg>
  );
};

export const ParkSignalLogo: React.FC<ParkSignalLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'auto',
  height = 36
}) => {
  const numericHeight = typeof height === 'number' ? height : parseInt(height, 10) || 36;

  // Emblem Only
  if (variant === 'emblem') {
    return <ParkSignalEmblemSvg size={numericHeight} className={className} />;
  }

  // Compact Header / Navbar Lockup (height <= 30)
  if (numericHeight <= 30) {
    return (
      <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
        <ParkSignalEmblemSvg size={numericHeight} />
        <div className="flex items-center gap-1 font-display font-black leading-none tracking-tight">
          <span className="text-neutral-900 dark:text-white text-sm sm:text-base">
            PARK
          </span>
          <span className="text-cyan-500 text-sm sm:text-base">
            SIGNAL
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Lockup with Subtitle
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 ${className}`}>
      <ParkSignalEmblemSvg size={numericHeight} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-0.5 font-display font-black tracking-tight">
          <span
            style={{ fontSize: Math.round(numericHeight * 0.48) }}
            className="text-neutral-900 dark:text-white leading-none"
          >
            PARK
          </span>
          <span
            style={{ fontSize: Math.round(numericHeight * 0.48) }}
            className="text-cyan-500 leading-none"
          >
            SIGNAL
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          <span>by</span>
          <span className="text-cyan-600 dark:text-cyan-400">BharatUtility</span>
        </div>
      </div>
    </div>
  );
};
