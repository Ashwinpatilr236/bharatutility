import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Compass, MessageSquarePlus, ArrowRight, Sparkles } from 'lucide-react';

export const FinalDiscoveryCtaSection: React.FC = () => {
  const { navigateToAllTools, navigateToRequestTool, setCommandPaletteOpen } = useApp();

  return (
    <section className="py-1.5 sm:py-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-950 via-neutral-900 to-purple-950 text-white p-3.5 sm:p-5 overflow-hidden shadow-lg border border-indigo-500/25">
        {/* Ambient background decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center lg:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-indigo-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>220+ Free Indian Calculators & Converters</span>
            </div>

            <h2 className="text-sm sm:text-lg font-black font-display tracking-tight text-white">
              Looking for something specific?
            </h2>

            <p className="text-xs text-neutral-300 max-w-xl">
              Instant search across personal finance, citizen lookups, and document utilities.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-accent" />
              <span>Search Tools</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] bg-neutral-200 text-neutral-700 rounded font-mono font-bold">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={navigateToAllTools}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/30 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>All Categories</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={navigateToRequestTool}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-200 hover:text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Request Tool</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
