import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Tv, Clock, Heart, Folder, Settings, Search, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { ArrjsTvLogo } from './ArrjsTvLogo';
import { isTvBackKey } from './useSpatialNavigation';

interface IptvCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: number;
  onSelectCategory: (index: number) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  channelCounts?: Record<string, number>;
  isDrawerFocused?: boolean;
  onFocusDrawer?: () => void;
  onRequestChannelFocus?: () => void;
}

export const IptvCategoryDrawer: React.FC<IptvCategoryDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSettings,
  onOpenSearch,
  channelCounts = {},
  isDrawerFocused = true,
  onFocusDrawer,
  onRequestChannelFocus,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const autoScrollTimerRef = useRef<number | null>(null);

  // Check scroll position to toggle TV Scroll Up / Down Indicators
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const hasMoreAbove = el.scrollTop > 15;
    const hasMoreBelow = el.scrollTop + el.clientHeight < el.scrollHeight - 15;
    setCanScrollUp(hasMoreAbove);
    setCanScrollDown(hasMoreBelow);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isOpen) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [isOpen, categories, updateScrollState]);

  // Auto-scroll active category into view when opened or activeCategory changes
  useEffect(() => {
    if (isOpen) {
      const activeEl = itemRefs.current[activeCategory];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setTimeout(updateScrollState, 200);
    }
  }, [isOpen, activeCategory, updateScrollState]);

  // Smooth scroll helper for on-screen TV cursor buttons
  const scrollByPixels = (amount: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ top: amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 150);
  };

  // TV Cursor Edge Auto-Scroll: when cursor hovers near top or bottom edge, scroll automatically
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onFocusDrawer?.();
    const el = scrollContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseY = e.clientY;
    const topDistance = mouseY - rect.top;
    const bottomDistance = rect.bottom - mouseY;

    if (topDistance > 0 && topDistance < 45) {
      // Cursor near top edge -> scroll up
      el.scrollTop -= 6;
      updateScrollState();
    } else if (bottomDistance > 0 && bottomDistance < 45) {
      // Cursor near bottom edge -> scroll down
      el.scrollTop += 6;
      updateScrollState();
    }
  };

  const handleContainerMouseLeave = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Recently Viewed':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Favorites':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'All':
        return <Tv className="w-4 h-4 text-cyan-400" />;
      default:
        return <Folder className="w-4 h-4 text-sky-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent Click-Outside Dismiss Area */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/25 z-40 transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Smart TV Left Glass Panel */}
      <div
        className="absolute top-0 left-0 bottom-0 z-50 w-72 sm:w-84 flex flex-col transition-all duration-300 animate-in slide-in-from-left select-none shadow-2xl"
        style={{
          backgroundColor: 'rgba(6, 9, 15, 0.94)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '25px 0 70px rgba(0, 0, 0, 0.85), inset -1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => onFocusDrawer?.()}
      >
        {/* Drawer Header: ARRJS Smart TV Branding & Close Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0 bg-black/50 backdrop-blur-md">
          <ArrjsTvLogo size="sm" showText={true} badge="LIVE" subtitle="SMART TV" animated={true} />

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Drawer (Esc / Remote Back)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Action Bar */}
        <div className="px-3.5 py-2.5 border-b border-white/10 flex-shrink-0 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center gap-2.5 bg-black/40 hover:bg-black/60 text-neutral-300 text-xs px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-cyan-400/40 transition-all group shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-neutral-300 group-hover:text-white">Search TV channels...</span>
            <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-400 font-mono border border-white/10">
              /
            </kbd>
          </button>
        </div>

        {/* Categories Section with TV-Friendly Scroll Controls */}
        <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top TV Floating Scroll Up Helper Button */}
          {canScrollUp && (
            <button
              type="button"
              onClick={() => scrollByPixels(-220)}
              className="absolute top-1 left-3 right-5 z-20 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 animate-in fade-in"
              title="Click or Hover to scroll categories up"
            >
              <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
              <span>Scroll Up (▲)</span>
            </button>
          )}

          {/* Categories List Container */}
          <div
            ref={scrollContainerRef}
            onMouseMove={handleContainerMouseMove}
            onMouseLeave={handleContainerMouseLeave}
            className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 iptv-custom-scrollbar overscroll-contain"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 px-3 py-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Categories ({categories.length})</span>
              </div>
              <span className="text-[9px] text-neutral-400 font-normal normal-case">Use Remote ▲▼</span>
            </div>

            {categories.map((category, idx) => {
              const isActive = activeCategory === idx;
              const count = channelCounts[category];
              const isCategoryHighlighted = isActive && isDrawerFocused;

              return (
                <button
                  type="button"
                  key={category}
                  tabIndex={0}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onClick={() => {
                    onSelectCategory(idx);
                  }}
                  onMouseEnter={() => {
                    onFocusDrawer?.();
                  }}
                  onFocus={() => {
                    onFocusDrawer?.();
                    itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = (idx + 1) % categories.length;
                      itemRefs.current[next]?.focus();
                      itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      onSelectCategory(next);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = (idx - 1 + categories.length) % categories.length;
                      itemRefs.current[prev]?.focus();
                      itemRefs.current[prev]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      onSelectCategory(prev);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      onRequestChannelFocus?.();
                    } else if (isTvBackKey(e.nativeEvent as KeyboardEvent) || e.key === 'Escape' || e.key === 'Backspace') {
                      e.preventDefault();
                      onClose();
                    }
                  }}
                  className={`w-full text-left flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200 select-none group relative focus:outline-none ${
                    isActive
                      ? isCategoryHighlighted
                        ? 'bg-gradient-to-r from-cyan-500/35 via-indigo-500/25 to-transparent text-white font-bold shadow-lg ring-2 ring-cyan-400/80 scale-[1.02]'
                        : 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/15 to-transparent text-white/95 font-bold shadow-md'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white focus:bg-white/15 focus:text-white focus:ring-2 focus:ring-cyan-400/60'
                  }`}
                >
                  {/* Active Left Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-gradient-to-b from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_12px_rgba(0,242,254,0.9)]" />
                  )}

                  <div className="flex items-center gap-3 truncate min-w-0 pl-1">
                    <span className={isActive ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-white transition-colors'}>
                      {getCategoryIcon(category)}
                    </span>
                    <span
                      className={`text-sm tracking-wide truncate ${
                        isActive ? 'text-white font-bold' : 'font-medium'
                      }`}
                    >
                      {category}
                    </span>
                  </div>

                  {count !== undefined && count > 0 && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ml-2 ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                          : 'bg-white/10 text-neutral-400 group-hover:text-neutral-200'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom TV Floating Scroll Down Helper Button */}
          {canScrollDown && (
            <button
              type="button"
              onClick={() => scrollByPixels(220)}
              className="absolute bottom-1 left-3 right-5 z-20 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 animate-in fade-in"
              title="Click or Hover to scroll categories down"
            >
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              <span>Scroll Down (▼)</span>
            </button>
          )}
        </div>

        {/* Drawer Footer: Playlist Settings Trigger */}
        <div className="p-3 border-t border-white/10 bg-black/50 backdrop-blur-md flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center justify-center gap-2 text-xs text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 transition-all font-bold px-3 py-2.5 rounded-xl border border-white/10 hover:border-cyan-400/40 w-full shadow-sm"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>IPTV Playlist & Stream Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default IptvCategoryDrawer;
