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
  height = 42
}) => {
  if (variant === 'emblem') {
    return (
      <img
        src="/parksignal-emblem.png"
        alt="ParkSignal Emblem"
        style={{ height }}
        className={`inline-block object-contain ${className}`}
        loading="eager"
      />
    );
  }

  // Full Brand Logo with authentic cropped artwork
  // On light backgrounds, if theme is auto or light, we wrap in a subtle dark badge so the white text & glowing cyan are 100% visible and punchy
  if (theme === 'dark') {
    return (
      <img
        src="/parksignal-logo-dark.png"
        alt="ParkSignal by BharatUtility"
        style={{ height }}
        className={`inline-block object-contain rounded-xl ${className}`}
        loading="eager"
      />
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Sleek container ensuring contrast across both light & dark mode */}
      <div className="bg-neutral-900/95 dark:bg-neutral-900/80 px-3.5 py-1.5 rounded-2xl border border-neutral-800/80 shadow-md backdrop-blur-md flex items-center justify-center">
        <img
          src="/parksignal-logo.png"
          alt="ParkSignal by BharatUtility"
          style={{ height }}
          className="object-contain drop-shadow-sm"
          loading="eager"
        />
      </div>
    </div>
  );
};
