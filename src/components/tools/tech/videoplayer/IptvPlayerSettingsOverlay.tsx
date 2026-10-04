import React, { useRef } from 'react';
import { X, Check, Sliders, Volume2, Maximize2, Sparkles, CheckCircle2 } from 'lucide-react';
import { AspectRatio } from './types';
import { useSpatialNavigation } from './useSpatialNavigation';

interface IptvPlayerSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videoLevels: { height: number; bitrate?: number }[];
  currentVideoLevel: number;
  onSelectVideoLevel: (levelIndex: number) => void;
  audioTracks: { id: number; name?: string; language?: string }[];
  currentAudioTrack: number;
  onSelectAudioTrack: (trackId: number) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
}

export const IptvPlayerSettingsOverlay: React.FC<IptvPlayerSettingsOverlayProps> = ({
  isOpen,
  onClose,
  videoLevels,
  currentVideoLevel,
  onSelectVideoLevel,
  audioTracks,
  currentAudioTrack,
  onSelectAudioTrack,
  aspectRatio,
  onChangeAspectRatio,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useSpatialNavigation(panelRef, { enabled: isOpen, onBack: onClose, autoFocus: true });

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center sm:justify-end p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md bg-neutral-950/95 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col gap-5 max-h-full overflow-y-auto overscroll-contain iptv-custom-scrollbar animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">TV Player Settings</h3>
              <p className="text-[11px] text-neutral-400">Audio, Video Quality & Screen Framing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Settings (O)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Video Quality / Resolution */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Video Resolution</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono font-normal">
              {currentVideoLevel === -1 ? 'Adaptive Auto' : `${videoLevels[currentVideoLevel]?.height}p Active`}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Auto Adaptive Button */}
            <button
              type="button"
              onClick={() => onSelectVideoLevel(-1)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                currentVideoLevel === -1
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 font-extrabold'
                  : 'bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-white">Auto (Adaptive Bitrate)</div>
                <div className="text-[10px] text-neutral-400">
                  Adjusts dynamically based on your connection speed
                </div>
              </div>
              {currentVideoLevel === -1 && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            </button>

            {/* Manual Stream Levels */}
            {videoLevels.map((lvl, idx) => {
              const isSelected = currentVideoLevel === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectVideoLevel(idx)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 font-extrabold'
                      : 'bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{lvl.height}p High Definition</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Audio Tracks */}
        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Tracks</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {audioTracks.length > 0 ? (
              audioTracks.map((track) => {
                const isSelected = currentAudioTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectAudioTrack(track.id)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{track.name || `Audio Stream ${track.id}`}</span>
                    <div className="flex items-center gap-2">
                      {track.language && (
                        <span className="text-[10px] text-neutral-400 uppercase font-mono bg-white/10 px-2 py-0.5 rounded-md">
                          {track.language}
                        </span>
                      )}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-neutral-400 italic py-1 px-1">
                Standard broadcast audio (no alternate language tracks detected)
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Aspect Ratio */}
        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Display Aspect Ratio</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['cover', 'contain', 'fill'] as AspectRatio[]).map((mode) => {
              const isSelected = aspectRatio === mode;
              const labels: Record<AspectRatio, { title: string; desc: string }> = {
                cover: { title: 'Cover', desc: 'Cinema Zoom' },
                contain: { title: 'Fit', desc: 'Letterbox' },
                fill: { title: 'Fill', desc: 'Stretch Screen' },
              };
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeAspectRatio(mode)}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-white text-black shadow-lg shadow-white/10 font-extrabold'
                      : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold">{labels[mode].title}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-neutral-500'}`}>
                    {labels[mode].desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors text-center mt-1 border border-white/10"
        >
          Close Settings Menu (O)
        </button>
      </div>
    </div>
  );
};
