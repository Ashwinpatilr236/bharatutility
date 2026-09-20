import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, Search, Layers, Star } from 'lucide-react';
import { MobileCategoriesDrawer } from './MobileCategoriesDrawer';
import { triggerHapticFeedback } from '../../utils/haptics';

export const MobileNavDock: React.FC = () => {
  const { view, navigateToHome, navigateToAllTools, setCommandPaletteOpen, favorites } = useApp();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const isHomeActive = view.type === 'home';
  const isToolsActive = view.type === 'all-tools';
  const isCategoryActive = view.type === 'category' || isCategoriesOpen;
  const isFavActive = view.type === 'favorites';

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-neutral-300/90 dark:border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] safe-area-bottom transition-all w-full select-none"
      >
        <div className="w-full max-w-md mx-auto flex items-center justify-between text-center px-1.5 py-1 relative">
          {/* 1. Home */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              navigateToHome();
            }}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer relative ${
              isHomeActive
                ? 'text-accent font-extrabold'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform duration-200 ${isHomeActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">Home</span>
            {isHomeActive && (
              <span className="absolute -bottom-0.5 w-3 h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-200" />
            )}
          </button>

          {/* 2. All Tools */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              navigateToAllTools();
            }}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer relative ${
              isToolsActive
                ? 'text-accent font-extrabold'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-transform duration-200 ${isToolsActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">Tools</span>
            {isToolsActive && (
              <span className="absolute -bottom-0.5 w-3 h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-200" />
            )}
          </button>

          {/* 3. Central Search Trigger FAB */}
          <div className="flex-1 min-w-0 flex items-center justify-center relative">
            <button
              onClick={() => {
                triggerHapticFeedback('medium');
                setCommandPaletteOpen(true);
              }}
              className="flex items-center justify-center bg-gradient-to-tr from-accent via-accent to-indigo-600 text-white w-11 h-11 rounded-full shadow-lg shadow-accent/40 border-2 border-white dark:border-neutral-950 hover:scale-105 active:scale-90 transition-transform cursor-pointer -mt-5 shrink-0"
              aria-label="Search Indian tools & calculators"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* 4. Categories Drawer Trigger */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              setIsCategoriesOpen(true);
            }}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer relative ${
              isCategoryActive
                ? 'text-accent font-extrabold'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium'
            }`}
          >
            <Layers className={`w-5 h-5 transition-transform duration-200 ${isCategoryActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">Explore</span>
            {isCategoryActive && (
              <span className="absolute -bottom-0.5 w-3 h-1 bg-accent rounded-full animate-in fade-in zoom-in duration-200" />
            )}
          </button>

        {/* 5. Favorites / Saved */}
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            const btn = document.getElementById('favorites-history-button');
            if (btn) btn.click();
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer relative ${
            isFavActive
              ? 'text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Star className={`w-5 h-5 transition-transform duration-200 ${favorites.length > 0 ? 'fill-amber-500 text-amber-500' : 'stroke-[1.8]'} ${isFavActive ? 'scale-110' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-950" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">Saved</span>
          {isFavActive && (
            <span className="absolute -bottom-0.5 w-3 h-1 bg-amber-500 rounded-full animate-in fade-in zoom-in duration-200" />
          )}
        </button>
      </div>
    </nav>

    {/* Native Mobile Categories Drawer */}
    <MobileCategoriesDrawer
      isOpen={isCategoriesOpen}
      onClose={() => setIsCategoriesOpen(false)}
    />
  </>
  );
};
