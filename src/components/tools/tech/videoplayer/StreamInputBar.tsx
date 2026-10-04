import React, { useState, useRef } from 'react';
import {
  Link as LinkIcon,
  ListVideo,
  Upload,
  Play,
  Sparkles,
  FileText,
  AlertCircle
} from 'lucide-react';
import { InputMode, SampleStream } from './types';

interface StreamInputBarProps {
  onLoadDirectUrl: (url: string) => void;
  onLoadPlaylistUrl: (url: string) => Promise<void>;
  onLoadPlaylistFile: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const SAMPLE_STREAMS: SampleStream[] = [
  {
    name: 'Tears of Steel (HLS)',
    type: 'hls',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    description: 'Multi-bitrate adaptive live HLS stream with multi-audio tracks',
    format: 'HLS / M3U8',
  },
  {
    name: 'Big Buck Bunny (MP4)',
    type: 'direct',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Direct high-definition MP4 online video file',
    format: 'MP4 Video',
  },
  {
    name: 'Sintel Trailer (WebM)',
    type: 'direct',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    description: 'Direct high-definition MP4/WebM animated short',
    format: 'Direct Video',
  },
];

export const SAMPLE_M3U_PLAYLIST = `#EXTM3U
#EXTINF:-1 tvg-id="tos" tvg-name="Tears of Steel" group-title="Cinema",Tears of Steel (HLS 1080p)
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
#EXTINF:-1 tvg-id="bbb" tvg-name="Big Buck Bunny" group-title="Animation",Big Buck Bunny (Direct MP4)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
#EXTINF:-1 tvg-id="sintel" tvg-name="Sintel" group-title="Animation",Sintel 4K Trailer
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4
#EXTINF:-1 tvg-id="elephants" tvg-name="Elephants Dream" group-title="Cinema",Elephants Dream Open Movie
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
#EXTINF:-1 tvg-id="mux" tvg-name="Mux Test Stream" group-title="Test Streams",Mux Adaptive HLS Live Stream
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`;

export const StreamInputBar: React.FC<StreamInputBarProps> = ({
  onLoadDirectUrl,
  onLoadPlaylistUrl,
  onLoadPlaylistFile,
  isLoading,
}) => {
  const [mode, setMode] = useState<InputMode>('direct');
  const [directUrl, setDirectUrl] = useState<string>('');
  const [playlistUrl, setPlaylistUrl] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const trimmed = directUrl.trim();
    if (!trimmed) {
      setInputError('Please enter a video or stream URL');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setInputError('URL must start with http:// or https://');
      return;
    }
    onLoadDirectUrl(trimmed);
  };

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const trimmed = playlistUrl.trim();
    if (!trimmed) {
      setInputError('Please enter an M3U playlist URL');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setInputError('URL must start with http:// or https://');
      return;
    }
    await onLoadPlaylistUrl(trimmed);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await onLoadPlaylistFile(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDemoPlaylist = async () => {
    const blob = new Blob([SAMPLE_M3U_PLAYLIST], { type: 'text/plain' });
    const file = new File([blob], 'demo_sample_playlist.m3u', { type: 'text/plain' });
    await onLoadPlaylistFile(file);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200/80 dark:border-neutral-800 pb-3">
        <button
          onClick={() => {
            setMode('direct');
            setInputError(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
            mode === 'direct'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" /> Direct Video URL
        </button>

        <button
          onClick={() => {
            setMode('playlist-url');
            setInputError(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
            mode === 'playlist-url'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ListVideo className="w-4 h-4" /> M3U Playlist URL
        </button>

        <button
          onClick={() => {
            setMode('playlist-file');
            setInputError(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
            mode === 'playlist-file'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload M3U File
        </button>
      </div>

      {/* Mode 1: Direct Video URL */}
      {mode === 'direct' && (
        <form onSubmit={handleDirectSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter MP4, WebM, or HLS (.m3u8) video URL..."
                value={directUrl}
                onChange={(e) => {
                  setDirectUrl(e.target.value);
                  setInputError(null);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-current" /> Play Stream
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Supports online MP4, WebM, and HLS (m3u8) live streams and VOD files directly in your browser.
          </p>
        </form>
      )}

      {/* Mode 2: M3U Playlist URL */}
      {mode === 'playlist-url' && (
        <form onSubmit={handlePlaylistSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter public M3U / M3U8 playlist URL (e.g. https://example.com/playlist.m3u)..."
                value={playlistUrl}
                onChange={(e) => {
                  setPlaylistUrl(e.target.value);
                  setInputError(null);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm flex-shrink-0"
            >
              <ListVideo className="w-4 h-4" /> Load Playlist
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Note: The remote playlist server must allow CORS headers for web browser loading. If your playlist fails to fetch, download it and use the <strong>Upload M3U File</strong> tab instead.
          </p>
        </form>
      )}

      {/* Mode 3: Upload Local M3U File */}
      {mode === 'playlist-file' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".m3u,.m3u8,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="m3u-file-input"
          />
          <label
            htmlFor="m3u-file-input"
            className="w-full p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl hover:border-accent dark:hover:border-accent cursor-pointer flex flex-col items-center justify-center text-center transition-colors bg-neutral-50/50 dark:bg-neutral-950/50"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              Click to select an .m3u or .m3u8 playlist file
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Parsed 100% locally on your device. Completely bypasses remote CORS playlist download limits!
            </span>
          </label>
        </div>
      )}

      {/* Error message */}
      {inputError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{inputError}</span>
        </div>
      )}

      {/* Sample Quick-Picks */}
      <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Samples:
        </span>
        {SAMPLE_STREAMS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirectUrl(s.url);
              onLoadDirectUrl(s.url);
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors"
            title={s.description}
          >
            {s.name}
          </button>
        ))}
        <button
          onClick={handleLoadDemoPlaylist}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold transition-colors"
          title="Load 5 multi-genre sample channels from an embedded M3U file"
        >
          Demo M3U Playlist (5 Ch)
        </button>
      </div>
    </div>
  );
};
