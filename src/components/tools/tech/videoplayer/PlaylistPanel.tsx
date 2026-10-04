import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Star,
  Tv,
  Radio,
  Clock,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { ChannelItem } from './types';

interface PlaylistPanelProps {
  channels: ChannelItem[];
  selectedChannelId: string | null;
  onSelectChannel: (channel: ChannelItem) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
  recentChannelIds: string[];
}

const PAGE_SIZE = 60;

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  recentChannelIds,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Clean title helper
  const cleanTitle = (rawTitle: string): string => {
    return rawTitle
      .replace(/\s*[\(\[]?\d+p[\)\]]?/gi, '')
      .replace(/\s*\[Geo-blocked\]/gi, '')
      .trim();
  };

  // Extract unique groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      if (c.group && c.group.trim()) {
        set.add(c.group.trim());
      }
    });
    return Array.from(set).sort();
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    let result = channels;

    // Filter by group
    if (selectedGroup === 'Favorites') {
      result = result.filter((c) => favorites.includes(c.id));
    } else if (selectedGroup === 'Recent') {
      result = result
        .filter((c) => recentChannelIds.includes(c.id))
        .sort((a, b) => recentChannelIds.indexOf(a.id) - recentChannelIds.indexOf(b.id));
    } else if (selectedGroup !== 'All') {
      result = result.filter((c) => c.group === selectedGroup);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.group && c.group.toLowerCase().includes(q))
      );
    }

    return result;
  }, [channels, selectedGroup, searchQuery, favorites, recentChannelIds]);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  if (channels.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 text-center text-neutral-500">
        <Tv className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
        <p className="text-sm font-medium">No channels in current playlist.</p>
        <p className="text-xs text-neutral-400 mt-1">Load an M3U playlist above to browse live channels.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-500" /> Channel Lineup
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              ({filteredChannels.length} {filteredChannels.length === 1 ? 'stream' : 'streams'})
            </span>
          </h4>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-xs focus:ring-2 focus:ring-accent dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        <button
          onClick={() => {
            setSelectedGroup('All');
            setVisibleCount(PAGE_SIZE);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedGroup === 'All'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          All ({channels.length})
        </button>

        {favorites.length > 0 && (
          <button
            onClick={() => {
              setSelectedGroup('Favorites');
              setVisibleCount(PAGE_SIZE);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              selectedGroup === 'Favorites'
                ? 'bg-pink-600 text-white'
                : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> Favorites ({favorites.length})
          </button>
        )}

        {recentChannelIds.length > 0 && (
          <button
            onClick={() => {
              setSelectedGroup('Recent');
              setVisibleCount(PAGE_SIZE);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              selectedGroup === 'Recent'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Recent
          </button>
        )}

        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => {
              setSelectedGroup(grp);
              setVisibleCount(PAGE_SIZE);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGroup === grp
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Channel Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {visibleChannels.map((channel, index) => {
          const isSelected = selectedChannelId === channel.id;
          const isFav = favorites.includes(channel.id);

          return (
            <div
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-sm ring-1 ring-cyan-500/50'
                  : 'border-neutral-200/70 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Logo or placeholder */}
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt=""
                    className="w-9 h-9 rounded-lg object-contain bg-white/20 p-1 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-500">
                    <Tv className="w-4 h-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-400">
                      #{index + 1}
                    </span>
                    <h5
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-cyan-700 dark:text-cyan-300' : 'text-neutral-900 dark:text-white'
                      }`}
                      title={channel.name}
                    >
                      {cleanTitle(channel.name)}
                    </h5>
                  </div>
                  {channel.group && (
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                      {channel.group}
                    </span>
                  )}
                </div>
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(channel.id);
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-400 hover:text-pink-500 transition-colors flex-shrink-0"
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFav ? 'fill-pink-500 text-pink-500' : 'text-neutral-400'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Load More Button if playlist is large */}
      {visibleCount < filteredChannels.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" /> Show More Channels ({filteredChannels.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
