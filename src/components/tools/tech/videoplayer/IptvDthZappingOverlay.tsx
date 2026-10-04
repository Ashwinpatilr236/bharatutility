import React from 'react';
import { ChannelItem } from './types';

interface IptvDthZappingOverlayProps {
  typedChannelNumber: string;
  channels: ChannelItem[];
}

export const IptvDthZappingOverlay: React.FC<IptvDthZappingOverlayProps> = ({
  typedChannelNumber,
  channels,
}) => {
  if (!typedChannelNumber) return null;

  const targetChannel =
    channels.find((c) => c.id && c.id.toString() === typedChannelNumber) ||
    channels.find((_, idx) => (idx + 1).toString() === typedChannelNumber);

  return (
    <div className="absolute top-8 right-8 z-50 transition-all duration-300 pointer-events-none animate-in fade-in slide-in-from-top-4">
      <div
        className="px-6 py-4 flex items-center gap-5 rounded-2xl border border-white/20 shadow-2xl"
        style={{
          backgroundColor: 'rgba(10, 14, 22, 0.88)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: '0 15px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Typed Channel Digits */}
        <div
          className="font-black text-cyan-400 font-mono tracking-widest text-center"
          style={{
            fontSize: '44px',
            lineHeight: '1',
            textShadow: '0 0 20px rgba(0,240,255,0.6)',
            minWidth: '55px',
          }}
        >
          {typedChannelNumber}
          <span className="inline-block animate-pulse text-cyan-200">_</span>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/20" />

        {/* Preview Channel Info */}
        <div className="flex flex-col pr-2 min-w-[140px] max-w-[260px]">
          <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
            TUNING TO
          </span>
          <span className="font-bold text-white text-base truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
            {targetChannel ? targetChannel.name : 'Unknown Channel'}
          </span>
          {targetChannel?.group && (
            <span className="text-[11px] text-neutral-400 truncate">
              {targetChannel.group}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
