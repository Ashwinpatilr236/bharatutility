import React, { useRef, useEffect } from 'react';
import { Heart, Tv } from 'lucide-react';
import { ChannelItem } from './types';
import { EpgDataMap } from './epgParser';
import { IptvConstructionNotice } from './IptvConstructionNotice';

interface EpgGridProps {
  channels: ChannelItem[];
  activeChannel: number;
  onSelectChannel: (index: number) => void;
  playingChannelId?: string | number;
  epgData: EpgDataMap;
  favorites: (string | number)[];
  onToggleFavorite: (channelId: string | number) => void;
  categoryName?: string;
}

export const EpgGrid: React.FC<EpgGridProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  playingChannelId,
  epgData,
  favorites = [],
  onToggleFavorite,
  categoryName = 'Channels',
}) => {
  const timeHeaderRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeChannel]);

  // Helper to remove (1080p), (720p), [Geo-blocked] etc.
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\s*[\(\[]?\d+p[\)\]]?/gi, '')
      .replace(/\s*\[Geo-blocked\]/gi, '')
      .trim();
  };

  // Generate 12 x 30-min time slots from current hour
  const timeSlots = [];
  const current = new Date();
  current.setMinutes(0, 0, 0);
  for (let i = 0; i < 12; i++) {
    timeSlots.push(new Date(current.getTime() + i * 30 * 60000));
  }

  // Handle synchronized horizontal scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: string | number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (timeHeaderRef.current && index !== 'header') {
      timeHeaderRef.current.scrollLeft = scrollLeft;
    }
    rowsRef.current.forEach((row, i) => {
      if (row && i !== index) {
        row.scrollLeft = scrollLeft;
      }
    });
  };

  return (
    <div className="w-full flex flex-col overflow-hidden rounded-t-3xl bg-black/60 backdrop-blur-xl border border-white/10" style={{ height: '380px' }}>
      {/* Header Row */}
      <div
        className="flex items-center py-2.5 pr-3 mb-1 text-[10px] uppercase text-neutral-400 font-bold tracking-widest bg-black/40 border-b border-white/10"
        style={{ paddingLeft: '1.25rem' }}
      >
        <div
          className="font-extrabold flex-shrink-0 pr-3 border-r border-white/15 text-cyan-400 flex items-center justify-between gap-2 truncate"
          style={{ width: '18rem', minWidth: '18rem', maxWidth: '18rem' }}
        >
          <span className="truncate">{categoryName}</span>
          <IptvConstructionNotice compact featureName="EPG Guide" />
        </div>
        <div
          className="flex-1 flex overflow-x-auto no-scrollbar pl-3 gap-2"
          ref={timeHeaderRef}
          onScroll={(e) => handleScroll(e, 'header')}
        >
          {timeSlots.map((time, i) => (
            <div key={i} className="flex-shrink-0 font-medium text-neutral-300" style={{ width: '150px' }}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ))}
        </div>
      </div>

      {/* Channels & Programs List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {channels.map((channel, idx) => {
          let programs: { title: string; width: number; isLive: boolean }[] = [];

          if (channel.tvgId && epgData && epgData[channel.tvgId] && epgData[channel.tvgId].length > 0) {
            // Real EPG data from XMLTV
            const now = new Date();
            programs = epgData[channel.tvgId].map((prog) => {
              const isLive = now >= prog.start && now < prog.stop;
              const durationMinutes = Math.max(15, (prog.stop.getTime() - prog.start.getTime()) / 60000);
              const width = Math.max(110, (durationMinutes / 30) * 150);
              return { title: prog.title, width, isLive };
            });
          } else {
            // Authentic TV guide fallback blocks
            programs = [
              { title: `${cleanText(channel.name)} Live Broadcast`, width: 320, isLive: true },
              { title: 'Prime Time Highlights', width: 220, isLive: false },
              { title: 'Special Feature', width: 200, isLive: false },
              { title: 'Late Night Stream', width: 400, isLive: false },
            ];
          }

          const isRowActive = activeChannel === idx;
          const isRowPlaying = playingChannelId === channel.id;
          const isFav = favorites.includes(channel.id);

          return (
            <div
              key={channel.id || idx}
              ref={isRowActive ? activeRowRef : null}
              className={`flex items-center py-1.5 pr-3 transition-colors border-b border-white/5 rounded-lg mb-1 ${
                isRowActive
                  ? 'bg-white/10 ring-1 ring-white/20'
                  : 'hover:bg-white/5'
              } ${isRowPlaying ? 'bg-cyan-500/20 ring-1 ring-cyan-400' : ''}`}
              style={{ paddingLeft: '1.25rem' }}
            >
              {/* Channel Info Left Column */}
              <div
                className="overflow-hidden flex items-center gap-3 flex-shrink-0 cursor-pointer pr-3 border-r border-white/15"
                style={{ width: '16rem', minWidth: '16rem', maxWidth: '16rem' }}
                onClick={() => onSelectChannel(idx)}
              >
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt=""
                    className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold flex-shrink-0">
                    <Tv className="w-5 h-5 text-neutral-500" />
                  </div>
                )}

                <div className="flex-1 overflow-hidden flex items-center min-w-0">
                  <span className="text-neutral-400 text-xs font-mono font-bold w-7 flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div
                    className={`font-bold text-xs sm:text-sm truncate flex-1 ${
                      isRowActive ? 'text-cyan-400' : 'text-white'
                    }`}
                    title={channel.name}
                  >
                    {cleanText(channel.name)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    className="ml-2 p-1 rounded-full hover:bg-white/10 focus:outline-none transition-colors"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-pink-500 text-pink-500' : 'text-neutral-400 hover:text-white'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Programs Timeline Horizontal Scroll */}
              <div
                className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar pl-3"
                ref={(el) => (rowsRef.current[idx] = el)}
                onScroll={(e) => handleScroll(e, idx)}
              >
                {programs.map((prog, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => onSelectChannel(idx)}
                    className={`p-2 px-3 flex-shrink-0 cursor-pointer rounded-xl transition-all duration-200 ${
                      prog.isLive && isRowActive
                        ? 'bg-white text-black font-bold shadow-lg ring-1 ring-white'
                        : 'bg-neutral-900/70 hover:bg-white/10 text-neutral-200'
                    }`}
                    style={{ width: `${prog.width}px` }}
                  >
                    <div
                      className={`text-xs font-bold truncate ${
                        prog.isLive && isRowActive ? 'text-black' : 'text-neutral-200'
                      }`}
                    >
                      {cleanText(prog.title)}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        prog.isLive && isRowActive ? 'text-neutral-800 font-extrabold' : 'text-neutral-400'
                      }`}
                    >
                      {prog.isLive ? '🔴 Live Now' : 'Upcoming'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpgGrid;
