import React from 'react';

interface ParkSignalLogoProps {
  variant?: 'full' | 'emblem' | 'compact';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  height?: number | string;
}

export const ParkSignalLogo: React.FC<ParkSignalLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'auto',
  height = 42
}) => {
  // If variant is emblem only
  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 260 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        style={{ height }}
      >
        <defs>
          <linearGradient id="psGradEmblem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <linearGradient id="psSignalGradEmblem" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0077FE" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>

        {/* 1. Radiating Signal Arcs */}
        <path d="M 98 46 A 48 48 0 0 1 184 46" fill="none" stroke="url(#psSignalGradEmblem)" strokeWidth="7" strokeLinecap="round" />
        <path d="M 108 59 A 34 34 0 0 1 174 59" fill="none" stroke="url(#psSignalGradEmblem)" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M 119 72 A 20 20 0 0 1 163 72" fill="none" stroke="url(#psSignalGradEmblem)" strokeWidth="6" strokeLinecap="round" />

        {/* 2. QR Code Pixel Matrix Blocks */}
        <rect x="36" y="86" width="26" height="26" rx="4" fill="none" stroke="#00B4D8" strokeWidth="4.5" />
        <rect x="44" y="94" width="10" height="10" rx="1.5" fill="#00E5FF" />
        <rect x="20" y="74" width="9" height="9" rx="1.5" fill="#00B4D8" />
        <rect x="38" y="74" width="9" height="9" rx="1.5" fill="#0077B6" />
        <rect x="18" y="98" width="9" height="9" rx="1.5" fill="#0096C7" />
        <rect x="70" y="84" width="8" height="8" rx="1.5" fill="#00B4D8" />
        <rect x="70" y="98" width="8" height="8" rx="1.5" fill="#023E8A" />
        <rect x="84" y="92" width="7" height="7" rx="1.5" fill="#0077B6" />
        <path d="M 28 116 C 28 128 38 136 50 136" fill="none" stroke="#0077B6" strokeWidth="5" strokeLinecap="round" />

        {/* 3. Aerodynamic Car Outline */}
        <path
          d="M 166 93 C 182 102 210 106 238 110 C 252 112 258 118 258 126 C 258 132 254 135 244 135"
          fill="none"
          stroke="url(#psGradEmblem)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <line x1="88" y1="135" x2="178" y2="135" stroke="url(#psGradEmblem)" strokeWidth="6" strokeLinecap="round" />

        {/* 4. Wheels */}
        <circle cx="68" cy="135" r="17" fill="none" stroke="url(#psGradEmblem)" strokeWidth="6.5" />
        <circle cx="68" cy="135" r="5" fill="#00B4D8" />
        <circle cx="204" cy="135" r="17" fill="none" stroke="url(#psGradEmblem)" strokeWidth="6.5" />
        <circle cx="204" cy="135" r="5" fill="#00B4D8" />

        {/* 5. Central Security Shield Emblem */}
        <g transform="translate(141, 105)">
          <path
            d="M 0 -22 C 14 -22 22 -14 22 -4 C 22 14 6 25 0 29 C -6 25 -22 14 -22 -4 C -22 -14 -14 -22 0 -22 Z"
            fill="#090D16"
            stroke="url(#psGradEmblem)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M 0 -17 C -10 -17 -16 -10 -16 -2 C -16 11 -4 20 0 24 Z" fill="#FFFFFF" />
          <path d="M 0 -17 C 10 -17 16 -10 16 -2 C 16 11 4 20 0 24 Z" fill="#0099FF" />
        </g>
      </svg>
    );
  }

  // Full Brand Logo with Typography
  const textColorClass =
    theme === 'dark'
      ? 'fill-white'
      : theme === 'light'
      ? 'fill-slate-900'
      : 'fill-slate-900 dark:fill-white';

  const subtitleColorClass =
    theme === 'dark'
      ? 'fill-slate-300'
      : theme === 'light'
      ? 'fill-slate-600'
      : 'fill-slate-600 dark:fill-slate-300';

  const taglineColorClass =
    theme === 'dark'
      ? 'fill-slate-400'
      : theme === 'light'
      ? 'fill-slate-500'
      : 'fill-slate-500 dark:fill-slate-400';

  return (
    <svg
      viewBox="0 0 630 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id="psGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
        <linearGradient id="psSignalGradFull" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0077FE" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <linearGradient id="psWordmarkSignal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#0077FF" />
        </linearGradient>
        <linearGradient id="psUtilityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Emblem Section */}
      <g transform="translate(10, 0)">
        {/* Signal Arcs */}
        <path d="M 98 46 A 48 48 0 0 1 184 46" fill="none" stroke="url(#psSignalGradFull)" strokeWidth="7" strokeLinecap="round" />
        <path d="M 108 59 A 34 34 0 0 1 174 59" fill="none" stroke="url(#psSignalGradFull)" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M 119 72 A 20 20 0 0 1 163 72" fill="none" stroke="url(#psSignalGradFull)" strokeWidth="6" strokeLinecap="round" />

        {/* QR Pixels */}
        <rect x="36" y="86" width="26" height="26" rx="4" fill="none" stroke="#00B4D8" strokeWidth="4.5" />
        <rect x="44" y="94" width="10" height="10" rx="1.5" fill="#00E5FF" />
        <rect x="20" y="74" width="9" height="9" rx="1.5" fill="#00B4D8" />
        <rect x="38" y="74" width="9" height="9" rx="1.5" fill="#0077B6" />
        <rect x="18" y="98" width="9" height="9" rx="1.5" fill="#0096C7" />
        <rect x="70" y="84" width="8" height="8" rx="1.5" fill="#00B4D8" />
        <rect x="70" y="98" width="8" height="8" rx="1.5" fill="#023E8A" />
        <rect x="84" y="92" width="7" height="7" rx="1.5" fill="#0077B6" />
        <path d="M 28 116 C 28 128 38 136 50 136" fill="none" stroke="#0077B6" strokeWidth="5" strokeLinecap="round" />

        {/* Car Outline */}
        <path
          d="M 166 93 C 182 102 210 106 238 110 C 252 112 258 118 258 126 C 258 132 254 135 244 135"
          fill="none"
          stroke="url(#psGradFull)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <line x1="88" y1="135" x2="178" y2="135" stroke="url(#psGradFull)" strokeWidth="6" strokeLinecap="round" />

        {/* Wheels */}
        <circle cx="68" cy="135" r="17" fill="none" stroke="url(#psGradFull)" strokeWidth="6.5" />
        <circle cx="68" cy="135" r="5" fill="#00B4D8" />
        <circle cx="204" cy="135" r="17" fill="none" stroke="url(#psGradFull)" strokeWidth="6.5" />
        <circle cx="204" cy="135" r="5" fill="#00B4D8" />

        {/* Shield */}
        <g transform="translate(141, 105)">
          <path
            d="M 0 -22 C 14 -22 22 -14 22 -4 C 22 14 6 25 0 29 C -6 25 -22 14 -22 -4 C -22 -14 -14 -22 0 -22 Z"
            fill="#090D16"
            stroke="url(#psGradFull)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M 0 -17 C -10 -17 -16 -10 -16 -2 C -16 11 -4 20 0 24 Z" fill="#FFFFFF" />
          <path d="M 0 -17 C 10 -17 16 -10 16 -2 C 16 11 4 20 0 24 Z" fill="#0099FF" />
        </g>
      </g>

      {/* Typography Section */}
      <g transform="translate(285, 0)">
        {/* PARKSIGNAL */}
        <text
          x="0"
          y="70"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="48"
          fontWeight="900"
          letterSpacing="1"
        >
          <tspan className={textColorClass}>PARK</tspan>
          <tspan fill="url(#psWordmarkSignal)">SIGNAL</tspan>
        </text>

        {/* by BharatUtility */}
        <text
          x="2"
          y="105"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="24"
        >
          <tspan className={subtitleColorClass} fontWeight="500">by </tspan>
          <tspan className={textColorClass} fontWeight="900">Bharat</tspan>
          <tspan fill="url(#psUtilityGrad)" fontWeight="900">Utility</tspan>
        </text>

        {/* Your Vehicle. Your Privacy. */}
        <text
          x="2"
          y="134"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="15"
          fontWeight="600"
          letterSpacing="0.8"
          className={taglineColorClass}
        >
          Your Vehicle. Your Privacy.
        </text>
      </g>
    </svg>
  );
};
