import React from 'react';
import { Heart, Tv, Radio } from 'lucide-react';
import { ChannelItem } from './types';

interface IptvChannelChangeBannerProps {
  channel: ChannelItem | null;
  channelIndex: number;
  isFavorite: boolean;
  isVisible: boolean;
  programTitle?: string;
}

export const IptvChannelChangeBanner: React.FC<IptvChannelChangeBannerProps> = ({
  channel,
  channelIndex,
  isFavorite,
  isVisible,
  programTitle,
}) => {
  if (!isVisible || !channel) return null;

  // Quality badge extraction
  const getQualityBadge = (name: string) => {
    if (!name) return 'HD';
    const match = name.match(/\s*[\(\[]?(1080p|720p|576p|480p|4k|2160p|FHD|HD|SD|UHD)[\)\]]?/i);
    if (!match) return 'HD';
    const tag = match[1].toLowerCase();
    if (tag === '1080p' || tag === 'fhd') return 'FULL HD';
    if (tag === '720p' || tag === 'hd') return 'HD';
    if (tag === '4k' || tag === '2160p' || tag === 'uhd') return '4K';
    return tag.toUpperCase();
  };

  const badge = getQualityBadge(channel.name);
  const is4K = badge === '4K';
  const isFHD = badge === 'FULL HD';
  const badgeGradient = is4K
    ? 'from-rose-500 via-pink-600 to-rose-700'
    : isFHD
    ? 'from-amber-400 via-yellow-500 to-amber-600'
    : 'from-cyan-400 via-sky-500 to-blue-600';

  const cleanName = channel.name
    ?.replace(/\s*[\(\[]?(1080p|720p|576p|480p|4k|2160p|FHD|HD|SD|UHD)[\)\]]?/i, '')
    ?.replace(/\s*\[Geo-blocked\]/gi, '')
    ?.trim() || 'Channel';

  return (
    <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div
        className="px-5 py-3 rounded-2xl flex items-center gap-4 text-white border border-white/20 shadow-2xl backdrop-blur-2xl"
        style={{
          backgroundColor: 'rgba(10, 14, 22, 0.92)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Channel Number */}
        <div className="font-mono font-black text-2xl sm:text-3xl text-cyan-400 leading-none flex-shrink-0">
          {channelIndex + 1}
        </div>

        {/* Channel Logo */}
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0 text-cyan-400">
            <Tv className="w-5 h-5" />
          </div>
        )}

        {/* Channel Title & Live Program */}
        <div className="flex flex-col min-w-[120px] max-w-[260px] sm:max-w-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-white truncate">
              {cleanName}
            </span>
            {isFavorite && (
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-neutral-400 truncate">
            {programTitle || (channel.group ? `Category: ${channel.group}` : 'Live Broadcast')}
          </span>
        </div>

        {/* Resolution Badge */}
        <div className={`p-0.5 rounded-lg bg-gradient-to-br ${badgeGradient} flex-shrink-0 shadow-md`}>
          <div className="bg-neutral-950 px-2 py-0.5 rounded-[6px] text-center">
            <span className="text-[9px] font-black tracking-wider text-white block">
              {is4K ? '2160p' : isFHD ? '1080p' : '720p'}
            </span>
            <span className="text-[8px] font-extrabold text-cyan-300 block leading-none">
              {badge}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
