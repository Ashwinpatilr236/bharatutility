import React from 'react';
import { Heart, Tv, Grid, Search, Settings as SettingsIcon, Play, Pause, Maximize } from 'lucide-react';
import { ChannelItem } from './types';

interface IptvMiniGuideProps {
  channel: ChannelItem;
  channelIndex: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenEpg: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentProgramTitle?: string;
  currentProgramDesc?: string;
  progressPercent?: number;
}

export const IptvMiniGuide: React.FC<IptvMiniGuideProps> = ({
  channel,
  channelIndex,
  isFavorite,
  onToggleFavorite,
  onOpenEpg,
  onOpenSearch,
  onOpenSettings,
  onToggleFullscreen,
  isPlaying,
  onTogglePlay,
  currentProgramTitle = 'Live Broadcast Stream',
  currentProgramDesc = 'Broadcasting online content via Video Player by ARRJS',
  progressPercent = 45,
}) => {
  // Quality badge helper
  const getQualityBadge = (name: string) => {
    if (!name) return null;
    const match = name.match(/\s*[\(\[]?(1080p|720p|576p|480p|4k|2160p|FHD|HD|SD|UHD)[\)\]]?/i);
    if (!match) return 'HD';
    const tag = match[1].toLowerCase();
    if (tag === '1080p' || tag === 'fhd') return 'FULL HD';
    if (tag === '720p' || tag === 'hd') return 'HD';
    if (tag === '4k' || tag === '2160p' || tag === 'uhd') return '4K';
    if (tag === '576p' || tag === '480p' || tag === 'sd') return 'SD';
    return tag.toUpperCase();
  };

  const qualityBadge = getQualityBadge(channel.name);
  const is4K = qualityBadge === '4K';
  const isFHD = qualityBadge === 'FULL HD';

  const badgeClass = is4K
    ? 'badge-rose-metallic'
    : isFHD
    ? 'badge-gold-metallic'
    : 'badge-cyan-metallic';

  const resText = is4K ? '2160p' : isFHD ? '1080p' : '720p';

  const cleanName = channel.name
    ?.replace(/\s*[\(\[]?(1080p|720p|576p|480p|4k|2160p|FHD|HD|SD|UHD)[\)\]]?/i, '')
    ?.replace(/\s*\[Geo-blocked\]/gi, '')
    ?.trim() || 'Channel';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="iptv-glass-card transition-all duration-300 z-40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-white max-w-4xl mx-auto w-[94%] sm:w-[90%]"
    >
      <div className="w-full flex flex-col gap-2.5">
        {/* Top Row: Channel Number, Logo, Name, Resolution Badge, Favorite, Clock */}
        <div className="flex justify-between items-center gap-2">
          {/* Channel Left Meta */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="font-black text-2xl sm:text-4xl text-white font-mono leading-none tracking-tight flex-shrink-0">
              {channelIndex + 1}
            </span>

            {channel.logo ? (
              <img
                src={channel.logo}
                alt=""
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0 text-cyan-400">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-xl text-white truncate tracking-wide">
                {cleanName}
              </h2>
              {channel.group && (
                <span className="text-[10px] sm:text-xs text-neutral-400 font-medium truncate block">
                  {channel.group}
                </span>
              )}
            </div>
          </div>

          {/* Right Meta: Badge, Favorite, Time */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Metallic Broadcast Resolution Badge */}
            <div className={`p-0.5 rounded-lg ${badgeClass}`}>
              <div className="bg-neutral-950 px-2 py-0.5 sm:py-1 rounded-md flex flex-col items-center justify-center leading-none">
                <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-white">
                  {resText}
                </span>
                <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-cyan-300">
                  {qualityBadge}
                </span>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
              title={isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
            >
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  isFavorite ? 'fill-pink-500 text-pink-500 drop-shadow' : 'text-neutral-400 hover:text-white'
                }`}
              />
            </button>

            {/* Digital Clock */}
            <div className="font-bold text-sm sm:text-lg text-white/90 font-mono hidden xs:block">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="h-px bg-white/10 my-0.5"></div>

        {/* Bottom Row: Program Info & Quick Controls / Remote Key Hints */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* Program Info */}
          <div className="flex flex-col flex-1 min-w-0 pr-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                LIVE NOW:
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {currentProgramTitle}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {currentProgramDesc}
            </p>

            {/* Program progress bar */}
            <div className="w-full max-w-xs h-1 bg-white/15 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
              ></div>
            </div>
          </div>

          {/* Interactive Action Buttons & Remote Hints */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center flex-shrink-0">
            <button
              onClick={onTogglePlay}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              title="Play / Pause"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={onOpenEpg}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/30"
              title="Open TV Guide / EPG"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Guide (EPG)</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Search Channels (/)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Playlist Settings (S)"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Fullscreen (F)"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
