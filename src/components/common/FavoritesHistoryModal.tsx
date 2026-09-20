import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_REGISTRY, getToolBySlug } from '../../data/toolsRegistry';
import { DynamicIcon } from './DynamicIcon';
import { Star, History, Trash2, X, ArrowRight, Clock } from 'lucide-react';

interface FavoritesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'favorites' | 'history';
}

export const FavoritesHistoryModal: React.FC<FavoritesHistoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'favorites',
}) => {
  const { favorites, toggleFavorite, calculationHistory, clearHistory, navigateToTool, navigateToFavorites } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>(initialTab);

  if (!isOpen) return null;

  const favoriteTools = favorites
    .map(slug => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 safe-area-bottom"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-accent-subtle text-accent'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>Saved ({favoriteTools.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-accent-subtle text-accent'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History ({calculationHistory.length})</span>
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 -webkit-overflow-scrolling-touch">
          {activeTab === 'favorites' ? (
            favoriteTools.length === 0 ? (
              <div className="py-12 text-center">
                <Star className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  No saved tools yet
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  Click the star icon on any calculator to bookmark it here for quick access.
                </p>
              </div>
            ) : (
              favoriteTools.map(tool => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 hover:border-accent/40 transition-colors group"
                >
                  <div
                    onClick={() => {
                      navigateToTool(tool.slug);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-xs text-accent">
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors truncate">
                        {tool.name}
                      </h5>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {tool.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <button
                      onClick={() => toggleFavorite(tool.slug)}
                      aria-label="Remove favorite"
                      className="p-1.5 text-amber-500 hover:text-neutral-400 transition-colors"
                      title="Remove from favorites"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => {
                        navigateToTool(tool.slug);
                        onClose();
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : calculationHistory.length === 0 ? (
            <div className="py-12 text-center">
              <History className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No recent calculations
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                Your completed calculations will appear here so you can review or restore previous parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-neutral-400">
                  {calculationHistory.length} saved calculations
                </span>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
              {calculationHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigateToTool(item.toolSlug, item.params);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 hover:border-accent/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-accent">
                      {item.toolName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 font-mono">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Link to Full Page */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Stored locally in your browser</span>
          <button
            onClick={() => {
              onClose();
              navigateToFavorites();
            }}
            className="font-bold text-accent hover:underline flex items-center gap-1"
          >
            Open Favorites Page →
          </button>
        </div>
      </div>
    </div>
  );
};
