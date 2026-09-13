import React from 'react';
import { ExternalLink, Sparkles, Sun, ArrowRight, BookOpen, Flame, MapPin } from 'lucide-react';
import { Link } from '../common/Link';

export const SanatanNextShowcaseSection: React.FC = () => {
  const SANATAN_NEXT_URL = 'https://sanatannext.netlify.app/';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/20 dark:via-neutral-900 dark:to-neutral-950 border border-amber-200/80 dark:border-amber-500/20 p-6 sm:p-8 shadow-xs">
        {/* Decorative soft ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Column: Headline & Description */}
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-500/25">
              <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>ARRJS TECHNOLOGIES SISTER INITIATIVE</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
                  Discover Sanatan Next
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Cultural Heritage
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 font-display italic">
                &ldquo;Aane wali peedhi ke liye Sanatan gyan&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Explore a separate digital platform for Sanatan knowledge, 12 Jyotirlingas, 51 Shakti Peeths, Hindu panchang, and Indian cultural heritage.
            </p>

            {/* Quick feature tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <Flame className="w-3 h-3 text-amber-500" /> 12 Jyotirlingas
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <MapPin className="w-3 h-3 text-rose-500" /> 51 Shakti Peeths
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 font-medium">
                <BookOpen className="w-3 h-3 text-emerald-500" /> Panchang & Festivals
              </span>
            </div>
          </div>

          {/* Right Column: CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={SANATAN_NEXT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Explore Sanatan Next</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              to="/sanatan-next"
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
