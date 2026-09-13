import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Compass, MessageSquarePlus, ArrowRight, Sparkles } from 'lucide-react';

export const FinalDiscoveryCtaSection: React.FC = () => {
  const { navigateToAllTools, navigateToRequestTool, setCommandPaletteOpen } = useApp();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setCommandPaletteOpen(true);
    } else {
      navigateToAllTools();
    }
  };

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-neutral-900 to-purple-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-indigo-500/30 text-center">
        {/* Ambient background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>220+ Free Online Calculators & Converters</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Looking for something else?
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl mx-auto">
            Find the exact calculator, converter, or Indian citizen utility you need, or request a new custom tool.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-accent" />
              <span>Search All 220+ Tools</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-neutral-200 text-neutral-700 rounded font-mono font-bold">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={navigateToAllTools}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/40 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-300" />
              <span>Browse All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={navigateToRequestTool}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Request a Tool</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
