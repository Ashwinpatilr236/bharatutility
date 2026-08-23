import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/categories';
import { ThemeAccentPicker } from './ThemeAccentPicker';
import { FavoritesHistoryModal } from './FavoritesHistoryModal';
import { DynamicIcon } from './DynamicIcon';
import { Link } from './Link';
import {
  Search,
  Star,
  Layers,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Flame,
  Download
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    navigateToCategory,
    setCommandPaletteOpen,
    favorites,
    view
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isFavModalOpen, setIsFavModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              id="brand-logo-btn"
              to="/"
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-indigo-500 dark:to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="font-bold text-base tracking-tighter">₹U</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl font-display tracking-tight text-neutral-900 dark:text-white">
                    Bharat<span className="text-accent">Utility</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    TECH
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 -mt-1 font-medium hidden sm:inline">
                  ARRJS Ecosystem • Everyday Tools
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {/* 1. All Tools */}
              <Link
                to="/tools"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view.type === 'all-tools'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                All Tools
              </Link>

              {/* 2. Categories Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Categories
                  <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {isCategoriesOpen && (
                  <div
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                    className="absolute top-full left-0 mt-1.5 w-[520px] sm:w-[560px] max-h-[75vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Column 1: Core & Everyday Utilities */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                          <span>Core & Everyday Utilities</span>
                          <span className="text-[9px] text-accent font-semibold">7 Suites</span>
                        </div>
                        {CATEGORIES.filter(c => ['money', 'daily-life', 'construction', 'education', 'business', 'technology', 'datetime'].includes(c.id)).map(cat => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-accent-subtle text-accent shrink-0">
                                <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block truncate group-hover:text-accent">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-neutral-400 block truncate leading-tight">
                                  {cat.description}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded ml-2 shrink-0">
                              {cat.toolCount}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Column 2: Civic & Specialty Hubs */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                          <span>Civic & Specialty Hubs</span>
                          <span className="text-[9px] text-emerald-500 font-semibold">6 Suites</span>
                        </div>
                        {CATEGORIES.filter(c => ['india-services', 'document-tools', 'documents', 'vehicle-utility', 'travel-utility', 'travel'].includes(c.id)).map(cat => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block truncate group-hover:text-emerald-500">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-neutral-400 block truncate leading-tight">
                                  {cat.id === 'document-tools' ? '100% Client-side PDF Merge, Split & Compress' : cat.description}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded ml-2 shrink-0">
                              {cat.toolCount}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Finance & Tax */}
              <Link
                to="/category/money"
                className="hidden xl:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Finance & Tax</span>
              </Link>

              {/* 4. Request a Tool */}
              <Link
                to="/request-tool"
                className={`hidden lg:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors items-center gap-1.5 ${
                  view.type === 'request-tool'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Request a Tool</span>
              </Link>

              {/* 5. Favorites */}
              <Link
                to="/favorites"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  view.type === 'favorites'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-amber-500 fill-current' : 'text-neutral-400'}`} />
                <span>Favorites</span>
                {favorites.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Search Trigger, Favorites & Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Spotlight Button */}
            <button
              id="global-search-trigger"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100/90 dark:bg-neutral-900/90 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/90 text-neutral-500 dark:text-neutral-400 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xs hover:shadow-xs transition-all text-xs font-medium focus:ring-2 focus:ring-accent"
            >
              <Search className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="hidden sm:inline text-xs">Search Indian utilities...</span>
              <span className="sm:hidden text-xs">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200/90 dark:border-neutral-700 shadow-2xs">
                {typeof window !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* Saved & History Modal Trigger */}
            <button
              id="favorites-history-button"
              onClick={() => setIsFavModalOpen(true)}
              title="Saved tools and recent calculations"
              className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Star className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-950" />
              )}
            </button>

            {/* Theme & Accent Palette Switcher */}
            <ThemeAccentPicker />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-4 gap-2">
              <Link
                to="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>All Tools</span>
              </Link>
              <button
                onClick={() => {
                  setIsFavModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>Saved ({favorites.length})</span>
              </button>
              <Link
                to="/request-tool"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Request</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const banner = document.getElementById('pwa-install-btn');
                  if (banner) banner.click();
                  else {
                    window.dispatchEvent(new CustomEvent('bu:prompt-install'));
                  }
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-accent-subtle text-accent text-[11px] font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Install</span>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <DynamicIcon name={cat.icon} className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap justify-between items-center gap-2 text-xs text-neutral-500">
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline"
              >
                About BharatUtility
              </Link>
              <Link
                to="/request-tool"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline text-accent font-medium"
              >
                Request a Tool
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Favorites & History Modal */}
      <FavoritesHistoryModal
        isOpen={isFavModalOpen}
        onClose={() => setIsFavModalOpen(false)}
      />
    </>
  );
};
