import React from 'react';
import { Tool } from '../../types';
import { Link } from './Link';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: Tool;
}

const LIVE_API_SLUGS = new Set([
  'ifsc-code-finder',
  'sip-calculator',
  'gold-silver-rate-calculator',
  'crypto-inr-tax-calculator',
  'currency-converter',
  'aqi-weather-forecast',
  'live-aqi-weather-forecast',
  'daily-fuel-price-tracker',
  'fuel-price-tracker',
  'pin-code-finder'
]);

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const isLive = LIVE_API_SLUGS.has(tool.slug) || tool.slug.includes('ifsc');

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="p-3 sm:p-4 w-full min-w-[58vw] sm:min-w-[220px] overflow-hidden snap-start rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs border border-neutral-200/90 dark:border-neutral-800/90 text-left hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 dark:hover:shadow-black/40 transition-all duration-200 group flex flex-row sm:flex-col items-center sm:items-start justify-between gap-3 sm:gap-0 bu-card-hover"
    >
      <div className="flex flex-row sm:flex-col w-full min-w-0 items-center sm:items-start gap-3 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:mb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-accent/10 dark:bg-accent/15 text-accent flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs border border-accent/20">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>
          {isLive ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live API
            </span>
          ) : tool.badge ? (
            <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
              {tool.badge}
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors line-clamp-1 break-words">
              {tool.name}
            </h4>
            {isLive && (
              <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live API Connected" />
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 sm:mt-1 leading-relaxed break-words">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex mt-3.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 w-full items-center justify-between">
        <span className="capitalize text-[10px] text-neutral-400 font-semibold tracking-wide">
          {tool.category}
        </span>
        <span className="text-xs font-bold text-accent inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Open</span>
          <span>→</span>
        </span>
      </div>
    </Link>
  );
};
