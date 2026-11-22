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
        className={`inline-block object-contain ${className}`}
        loading="eager"
      />
    );
  }

  return (
    <img
      src="/parksignal-logo-transparent.png"
      alt="ParkSignal by BharatUtility"
      style={{ height }}
      className={`inline-block object-contain drop-shadow-xs ${className}`}
      loading="eager"
    />
  );
};
