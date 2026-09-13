import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, Search, Layers, Star } from 'lucide-react';

export const MobileNavDock: React.FC = () => {
  const { view, navigateToHome, navigateToAllTools, setCommandPaletteOpen, favorites } = useApp();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200/90 dark:border-neutral-800/90 px-2 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          onClick={navigateToHome}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            view.type === 'home'
              ? 'text-accent font-bold scale-105'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* 2. All Tools */}
        <button
          onClick={navigateToAllTools}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            view.type === 'all-tools'
              ? 'text-accent font-bold scale-105'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tools</span>
        </button>

        {/* 3. Central Search Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-accent text-white w-12 h-12 rounded-full shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Search tools"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* 4. Categories */}
        <button
          onClick={navigateToAllTools}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            view.type === 'category'
              ? 'text-accent font-bold scale-105'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </button>

        {/* 5. Favorites */}
        <button
          onClick={() => {
            const btn = document.getElementById('favorites-history-button');
            if (btn) btn.click();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            view.type === 'favorites'
              ? 'text-amber-500 font-bold scale-105'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Star className={`w-5 h-5 ${favorites.length > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5">Saved</span>
          {favorites.length > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-950" />
          )}
        </button>
      </div>
    </nav>
  );
};
