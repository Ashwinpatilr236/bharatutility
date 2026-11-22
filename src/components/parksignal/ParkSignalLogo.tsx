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

  if (variant === 'emblem') {
    return (
      <img
        src="/parksignal-emblem.png"
        alt="ParkSignal Emblem"
        style={{ height: numericHeight }}
        className={`inline-block object-contain select-none shrink-0 ${className}`}
        loading="eager"
      />
    );
  }

  return (
    <img
      src="/parksignal-logo.png"
      alt="ParkSignal by BharatUtility"
      style={{ height: numericHeight }}
      className={`inline-block object-contain select-none shrink-0 ${className}`}
      loading="eager"
    />
  );
};
