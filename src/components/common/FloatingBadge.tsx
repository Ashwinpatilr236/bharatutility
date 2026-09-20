import React from 'react';

interface FloatingBadgeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 4,
  distance = 8,
}) => {
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{
        animation: `antigravity-levitate ${duration}s ease-in-out ${delay}s infinite alternate`,
        ['--levitate-distance' as any]: `${distance}px`,
      }}
    >
      {children}
    </div>
  );
};
