import React from 'react';

interface ParkSignalLogoProps {
  variant?: 'full' | 'emblem';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  height?: number | string;
}

export const ParkSignalLogo: React.FC<ParkSignalLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'auto',
  height = 36
}) => {
  const numericHeight = typeof height === 'number' ? height : parseInt(height, 10) || 36;
  const emblemWidth = Math.round(numericHeight * 1.1);
  const fullWidth = Math.round(numericHeight * 4.2);

  if (variant === 'emblem') {
    return (
      <svg
        width={emblemWidth}
        height={numericHeight}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 select-none ${className}`}
      >
        {/* Car Outline in currentColor */}
        <path
          d="M8 32 L15 18 L33 18 L40 32 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          className="text-neutral-900 dark:text-white"
        />
        {/* Wheels */}
        <circle cx="15" cy="35" r="3.5" fill="#06B6D4" />
        <circle cx="33" cy="35" r="3.5" fill="#06B6D4" />
        {/* Radar Waves */}
        <path
          d="M14 12 A 16 16 0 0 1 34 12"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M7 6 A 24 24 0 0 1 41 6"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Full Brand Logo Lockup (Adapts dynamically to Light & Dark theme)
  return (
    <div
      style={{ height: numericHeight }}
      className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}
    >
      {/* Emblem */}
      <svg
        width={Math.round(numericHeight * 1.05)}
        height={numericHeight}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M8 32 L15 18 L33 18 L40 32 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          className="text-neutral-900 dark:text-white"
        />
        <circle cx="15" cy="35" r="3.5" fill="#06B6D4" />
        <circle cx="33" cy="35" r="3.5" fill="#06B6D4" />
        <path
          d="M14 12 A 16 16 0 0 1 34 12"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M7 6 A 24 24 0 0 1 41 6"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-0.5 tracking-tight font-black font-display text-neutral-900 dark:text-white text-base sm:text-lg">
          <span>PARK</span>
          <span className="text-cyan-500">SIGNAL</span>
        </div>
        <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
          BY BHARATUTILITY
        </span>
      </div>
    </div>
  );
};
