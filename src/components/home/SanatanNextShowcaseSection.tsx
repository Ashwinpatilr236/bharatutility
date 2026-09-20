import React from 'react';
import { ExternalLink, Sparkles, Sun, ArrowRight, BookOpen, Flame, MapPin } from 'lucide-react';
import { Link } from '../common/Link';

export const SanatanNextShowcaseSection: React.FC = () => {
  const SANATAN_NEXT_URL = 'https://sanatannext.netlify.app/';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-3">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-neutral-900 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-500/25 p-3.5 sm:p-4.5 shadow-xs">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5">
          {/* Left Column: Compact Info */}
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-500/25">
                <Sun className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>SISTER PROJECT</span>
              </span>
              <h3 className="text-sm sm:text-base font-black font-display tracking-tight text-neutral-900 dark:text-white">
                Discover Sanatan Next
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                Cultural Heritage
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-xl">
              Digital platform for Sanatan knowledge, 12 Jyotirlingas, 51 Shakti Peeths, Hindu panchang, and Indian festivals.
            </p>

            {/* Micro feature pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-0.5 text-[10px] text-neutral-600 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <Flame className="w-2.5 h-2.5 text-amber-500" /> 12 Jyotirlingas
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <MapPin className="w-2.5 h-2.5 text-rose-500" /> 51 Shakti Peeths
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <BookOpen className="w-2.5 h-2.5 text-emerald-500" /> Panchang & Vrat
              </span>
            </div>
          </div>

          {/* Right Column: Compact CTAs */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
            <a
              href={SANATAN_NEXT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>Explore Sanatan Next</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <Link
              to="/sanatan-next"
              className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all"
            >
              <span>Info</span>
              <ArrowRight className="w-3 h-3 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
