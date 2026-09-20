import React, { useState } from 'react';
import { socialLinks } from '../../config/social';
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PlatformConfig {
  key: keyof typeof socialLinks;
  label: string;
  tooltip: string;
  handle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    tooltip: 'Connect with ARRJS Technologies on LinkedIn',
    handle: 'arrjstechnologies',
    icon: Linkedin,
    colorClass: 'hover:bg-sky-700 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    tooltip: 'Follow @ARRJS_Tech on X',
    handle: '@ARRJS_Tech',
    icon: Twitter,
    colorClass: 'hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-neutral-900 hover:border-transparent',
    badgeClass: 'group-hover:text-neutral-900 dark:group-hover:text-white',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    tooltip: 'Follow @arrjstechnologies on Instagram',
    handle: '@arrjstechnologies',
    icon: Instagram,
    colorClass: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    tooltip: 'Follow ARRJS Technologies on Facebook',
    handle: 'arrjstechnologies',
    icon: Facebook,
    colorClass: 'hover:bg-blue-600 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
];

interface SocialFollowProps {
  className?: string;
  variant?: 'section' | 'compact' | 'footer';
}

export const SocialFollow: React.FC<SocialFollowProps> = ({
  className = '',
  variant = 'section'
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Filter out any platform whose URL is empty or whitespace
  const activePlatforms = PLATFORMS.filter(platform => {
    const url = socialLinks[platform.key];
    return typeof url === 'string' && url.trim().length > 0;
  });

  // If all social links are empty, return null gracefully
  if (activePlatforms.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {activePlatforms.map(platform => {
          const url = socialLinks[platform.key];
          const Icon = platform.icon;
          return (
            <div key={platform.key} className="relative group">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.tooltip}
                title={platform.tooltip}
                onMouseEnter={() => setActiveTooltip(platform.key)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 transition-all duration-200 hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent ${platform.colorClass}`}
              >
                <Icon className="w-4 h-4" />
              </a>
              {/* Tooltip */}
              {activeTooltip === platform.key && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-medium text-white bg-neutral-900 dark:bg-neutral-800 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95">
                  {platform.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section
      aria-label="Follow BharatUtility"
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-3 ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-r from-white via-neutral-50/60 to-white dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-900 p-3 sm:p-4 shadow-xs">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Header & Subtitle */}
          <div className="space-y-0.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-subtle text-accent text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Community</span>
              </span>
              <h3 className="text-sm sm:text-base font-bold font-display text-neutral-900 dark:text-white tracking-tight">
                Follow BharatUtility
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
              Stay updated with new tools, useful utilities, and community updates.
            </p>
          </div>

          {/* Social Platform Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activePlatforms.map(platform => {
              const url = socialLinks[platform.key];
              const Icon = platform.icon;
              const isHovered = activeTooltip === platform.key;

              return (
                <div key={platform.key} className="relative group">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.tooltip}
                    onMouseEnter={() => setActiveTooltip(platform.key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onFocus={() => setActiveTooltip(platform.key)}
                    onBlur={() => setActiveTooltip(null)}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-accent ${platform.colorClass}`}
                  >
                    <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold">{platform.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" />
                  </a>

                  {/* Accessible Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-medium text-white bg-neutral-900 dark:bg-neutral-800 rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95">
                      {platform.tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
