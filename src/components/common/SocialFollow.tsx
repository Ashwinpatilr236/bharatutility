import React, { useState } from 'react';
import { socialLinks } from '../../config/social';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Send,
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
    key: 'instagram',
    label: 'Instagram',
    tooltip: 'Follow @BharatUtility on Instagram',
    handle: '@bharatutility',
    icon: Instagram,
    colorClass: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    tooltip: 'Subscribe to BharatUtility on YouTube',
    handle: '@BharatUtility',
    icon: Youtube,
    colorClass: 'hover:bg-red-600 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-red-600 dark:group-hover:text-red-400',
  },
  {
    key: 'x',
    label: 'X / Twitter',
    tooltip: 'Follow @BharatUtility on X',
    handle: '@bharatutility',
    icon: Twitter,
    colorClass: 'hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-neutral-900 hover:border-transparent',
    badgeClass: 'group-hover:text-neutral-900 dark:group-hover:text-white',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    tooltip: 'Connect on LinkedIn',
    handle: 'BharatUtility',
    icon: Linkedin,
    colorClass: 'hover:bg-sky-700 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    tooltip: 'Join BharatUtility Telegram Channel',
    handle: 't.me/bharatutility',
    icon: Send,
    colorClass: 'hover:bg-sky-500 hover:text-white hover:border-transparent',
    badgeClass: 'group-hover:text-sky-500 dark:group-hover:text-sky-400',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    tooltip: 'Follow BharatUtility on Facebook',
    handle: 'BharatUtility',
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
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12 ${className}`}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-b from-white via-neutral-50/50 to-neutral-100/50 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-950 p-6 sm:p-8 lg:p-10 shadow-xs">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-8">
          {/* Header & Subtitle */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-subtle text-accent text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community & Updates</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight">
              Follow BharatUtility
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Stay updated with new tools, useful utilities and BharatUtility updates.
            </p>
          </div>

          {/* Social Platform Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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
                    className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent ${platform.colorClass}`}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold">{platform.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" />
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
