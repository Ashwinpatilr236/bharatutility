import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface IptvVolumeOsdProps {
  volume: number;
  isMuted: boolean;
  isVisible: boolean;
}

export const IptvVolumeOsd: React.FC<IptvVolumeOsdProps> = ({
  volume,
  isMuted,
  isVisible,
}) => {
  const displayPercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      className={`absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
    >
      <div
        className="py-6 px-4 flex flex-col items-center gap-5 rounded-3xl"
        style={{
          backgroundColor: 'rgba(10, 14, 22, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Icon & Label */}
        <div className="flex flex-col items-center gap-2">
          {isMuted ? (
            <div className="bg-red-500/20 p-2.5 rounded-full border border-red-500/40">
              <VolumeX className="w-6 h-6 text-red-400" />
            </div>
          ) : (
            <div className="bg-cyan-500/20 p-2.5 rounded-full border border-cyan-400/40">
              <Volume2 className="w-6 h-6 text-cyan-400" />
            </div>
          )}

          <span
            className={`font-black text-xl tracking-wider font-mono ${
              isMuted ? 'text-red-400' : 'text-white'
            }`}
          >
            {isMuted ? 'MUTE' : displayPercent}
          </span>
        </div>

        {/* Vertical Level Bar */}
        <div
          className="relative w-2.5 h-44 bg-neutral-800 rounded-full overflow-hidden"
          style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
        >
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-150 rounded-full"
            style={{
              height: `${displayPercent}%`,
              background: isMuted
                ? '#ef4444'
                : 'linear-gradient(0deg, #0284c7 0%, #00f0ff 100%)',
              boxShadow: isMuted
                ? '0 0 10px rgba(239, 68, 68, 0.6)'
                : '0 0 15px rgba(0, 240, 255, 0.8)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
