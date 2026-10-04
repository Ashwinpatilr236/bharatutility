import React, { useRef, useEffect } from 'react';
import { X, Tv, Clock, Heart, Folder, Settings, Search, Sparkles } from 'lucide-react';
import { ArrjsTvLogo } from './ArrjsTvLogo';

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
}) => {
  const activeCategoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen, activeCategory]);

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
        className="absolute top-0 left-0 bottom-0 z-50 w-72 sm:w-84 flex flex-col transition-all duration-300 animate-in slide-in-from-left duration-300 select-none shadow-2xl"
        style={{
          backgroundColor: 'rgba(6, 9, 15, 0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '25px 0 70px rgba(0, 0, 0, 0.85), inset -1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header: New ARRJS Smart TV Branding & Close Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 flex-shrink-0 bg-black/40 backdrop-blur-md">
          <ArrjsTvLogo size="sm" showText={true} badge="LIVE" subtitle="SMART TV" animated={true} />

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Action Bar */}
        <div className="px-3.5 py-3 border-b border-white/10 flex-shrink-0 bg-white/[0.02]">
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

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 no-scrollbar">
          <div className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 px-3 py-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Channel Lineup</span>
          </div>

          {categories.map((category, idx) => {
            const isActive = activeCategory === idx;
            const count = channelCounts[category];
            const isCategoryHighlighted = isActive && isDrawerFocused;

            return (
              <div
                key={category}
                ref={isActive ? activeCategoryRef : null}
                onClick={() => {
                  onSelectCategory(idx);
                }}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200 select-none group relative ${
                  isActive
                    ? isCategoryHighlighted
                      ? 'bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-transparent text-white font-bold shadow-lg ring-1 ring-cyan-400/60 scale-[1.02]'
                      : 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/15 to-transparent text-white/95 font-bold shadow-md'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
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
              </div>
            );
          })}
        </div>

        {/* Drawer Footer: Playlist Settings Trigger */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
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
