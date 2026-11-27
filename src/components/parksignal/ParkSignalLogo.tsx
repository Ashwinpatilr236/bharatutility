import React from 'react';
import { PARKSIGNAL_LIGHT_BG_LOGO_B64, PARKSIGNAL_DARK_BG_LOGO_B64, PARKSIGNAL_EMBLEM_B64 } from './parkSignalLogoBase64';

interface ParkSignalLogoProps {
  variant?: 'full' | 'emblem';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  height?: number | string;
}

/**
 * Authentic official ParkSignal emblem:
 * Aerodynamic car silhouette with 3 roof radar waves, center shield, dual wheels, and rear dissolving QR pixel blocks.
 */
export const ParkSignalEmblemSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <img
      src="/parksignal-emblem-official.png"
      alt="ParkSignal"
      style={{ height: size, width: 'auto' }}
      className={`shrink-0 select-none object-contain ${className}`}
      loading="eager"
    />
  );
};

export const ParkSignalLogo: React.FC<ParkSignalLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'auto',
  height = 36
}) => {
  const numericHeight = typeof height === 'number' ? height : parseInt(height, 10) || 36;

  // 1. Emblem Only
  if (variant === 'emblem') {
    return (
      <img
        src="/parksignal-emblem-official.png"
        alt="ParkSignal"
        style={{ height: numericHeight, width: 'auto' }}
        className={`shrink-0 select-none object-contain ${className}`}
        loading="eager"
      />
    );
  }

  // 2. Compact Header / Navbar Lockup (height <= 32)
  // Combines authentic emblem with crisp, legible vector typography
  if (numericHeight <= 32) {
    const textColor =
      theme === 'dark'
        ? 'text-white'
        : theme === 'light'
        ? 'text-neutral-900'
        : 'text-neutral-900 dark:text-white';

    return (
      <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
        <img
          src="/parksignal-emblem-official.png"
          alt="ParkSignal"
          style={{ height: numericHeight, width: 'auto' }}
          className="object-contain shrink-0"
          loading="eager"
        />
        <div className="flex items-center gap-0.5 font-display font-black leading-none tracking-tight">
          <span className={`${textColor} text-sm sm:text-base`}>
            PARK
          </span>
          <span className="text-cyan-500 text-sm sm:text-base">
            SIGNAL
          </span>
        </div>
      </div>
    );
  }

  // 3. Full Brand Lockup with Subtitle for Login, Register, Hero, etc.
  if (theme === 'dark') {
    return (
      <img
        src="/parksignal-logo-dark-bg.png"
        alt="ParkSignal by BharatUtility"
        style={{ height: numericHeight, width: 'auto' }}
        className={`object-contain shrink-0 select-none ${className}`}
        loading="eager"
      />
    );
  }

  if (theme === 'light') {
    return (
      <img
        src="/parksignal-logo-light-bg.png"
        alt="ParkSignal by BharatUtility"
        style={{ height: numericHeight, width: 'auto' }}
        className={`object-contain shrink-0 select-none ${className}`}
        loading="eager"
      />
    );
  }

  // Adaptive auto theme: renders dark text on light backgrounds and white text in dark mode
  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <img
        src="/parksignal-logo-light-bg.png"
        alt="ParkSignal by BharatUtility"
        style={{ height: numericHeight, width: 'auto' }}
        className="object-contain shrink-0 dark:hidden"
        loading="eager"
      />
      <img
        src="/parksignal-logo-dark-bg.png"
        alt="ParkSignal by BharatUtility"
        style={{ height: numericHeight, width: 'auto' }}
        className="object-contain shrink-0 hidden dark:block"
        loading="eager"
      />
    </div>
  );
};
