import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tv } from 'lucide-react';
import { ChannelItem } from './types';
import { isTvBackKey } from './useSpatialNavigation';

interface IptvSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelItem[];
  onSelectChannel: (channel: ChannelItem) => void;
}

export const IptvSearchOverlay: React.FC<IptvSearchOverlayProps> = ({
  isOpen,
  onClose,
  channels,
  onSelectChannel,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredChannels = query.trim()
    ? channels.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.group && c.group.toLowerCase().includes(q)) ||
          c.id.toString() === q
        );
      })
    : channels.slice(0, 50); // Show first 50 when empty

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTvBackKey(e.nativeEvent)) {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredChannels.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredChannels.length - 1));
    } else if (e.key === 'Enter') {
      if (filteredChannels[selectedIndex]) {
        onSelectChannel(filteredChannels[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-12 sm:pt-20 p-4 bg-black/85 backdrop-blur-xl transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900/90 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b-2 border-cyan-400 pb-3">
          <Search className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type channel name, number or category..."
            className="w-full bg-transparent text-white text-lg sm:text-2xl outline-none placeholder:text-neutral-500 font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results Count & Keyboard Hints */}
        <div className="flex justify-between items-center text-xs text-neutral-400 px-1">
          <span>Found {filteredChannels.length} channels</span>
          <div className="hidden sm:flex items-center gap-2">
            <span>Use</span>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-300">↑</kbd>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-300">↓</kbd>
            <span>to navigate,</span>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-300">ENTER</kbd>
            <span>to play</span>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={resultsRef}
          className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto overscroll-contain iptv-custom-scrollbar pr-1"
        >
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              No matching channels found for "{query}".
            </div>
          ) : (
            filteredChannels.map((c, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={c.id || idx}
                  onClick={() => {
                    onSelectChannel(c);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt=""
                        className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 text-cyan-400">
                        <Tv className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div
                        className={`font-bold text-sm sm:text-base truncate ${
                          isSelected ? 'text-cyan-300' : 'text-white'
                        }`}
                      >
                        {c.name}
                      </div>
                      {c.group && (
                        <div className="text-xs text-neutral-400 truncate">{c.group}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      #{c.id}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
