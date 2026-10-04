import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PictureInPicture,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Radio,
  Sliders,
  Settings,
  Tv
} from 'lucide-react';
import { AspectRatio } from './types';

interface VideoPlayerScreenProps {
  streamUrl: string;
  channelTitle?: string;
  channelLogo?: string;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  hasPrevChannel?: boolean;
  hasNextChannel?: boolean;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  streamUrl,
  channelTitle,
  channelLogo,
  onPrevChannel,
  onNextChannel,
  hasPrevChannel,
  hasNextChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('contain');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPipAvailable, setIsPipAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorHelp, setErrorHelp] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [videoLevels, setVideoLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto

  // Reset controls timer
  const scheduleHideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, showSettingsMenu]);

  const handleUserActivity = () => {
    setShowControls(true);
    scheduleHideControls();
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Check PiP support
  useEffect(() => {
    if (document.pictureInPictureEnabled && videoRef.current) {
      setIsPipAvailable(true);
    }
  }, []);

  // Core stream initialization & engine selection
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      setIsLoading(false);
      return;
    }

    // Reset states
    setIsLoading(true);
    setErrorMessage(null);
    setErrorHelp(null);
    setCurrentTime(0);
    setDuration(0);
    setIsLive(false);

    // Teardown previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Teardown previous video source
    video.pause();
    video.removeAttribute('src');
    video.load();

    const normalizedUrl = streamUrl.trim();
    const isDirectMp4OrWebm =
      normalizedUrl.match(/\.(mp4|webm|m4v|ogg|ogv)(\?|$)/i) !== null;
    const isHlsStream =
      normalizedUrl.match(/\.m3u8(\?|$)/i) !== null || !isDirectMp4OrWebm;

    let hlsInstance: Hls | null = null;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Autoplay unmuted failed, attempting muted autoplay:', err);
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch((mutedErr) => {
                console.warn('Muted autoplay also blocked:', mutedErr);
                setIsLoading(false);
                setIsPlaying(false);
              });
          });
      }
    };

    // Mode 1: HLS via hls.js
    if (isHlsStream && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hlsRef.current = hlsInstance;

      hlsInstance.loadSource(normalizedUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        if (data.levels && data.levels.length > 0) {
          setVideoLevels(
            data.levels.map((lvl, index) => ({
              id: index,
              height: lvl.height,
              bitrate: lvl.bitrate,
            }))
          );
        }
        playVideo();
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error:', data);
              setErrorMessage('Stream network error / connection failed');
              setErrorHelp(
                'The stream server may be offline, URL is invalid, or the remote server blocked in-browser playback (CORS restrictions).'
              );
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, attempting recovery...');
              hlsInstance?.recoverMediaError();
              break;
            default:
              console.warn('Fatal HLS Error, falling back to direct video element...');
              hlsInstance?.destroy();
              hlsRef.current = null;
              // Fallback directly to native video src
              video.src = normalizedUrl;
              playVideo();
              break;
          }
        }
      });
    }
    // Mode 2: Native Safari / iOS HLS or direct MP4/WebM
    else if (video.canPlayType('application/vnd.apple.mpegurl') || isDirectMp4OrWebm) {
      video.src = normalizedUrl;
      const onCanPlay = () => {
        setIsLoading(false);
        playVideo();
      };
      video.addEventListener('canplay', onCanPlay, { once: true });
    } else {
      // Fallback
      video.src = normalizedUrl;
      playVideo();
    }

    // Video element event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onDurationChange = () => {
      const dur = video.duration;
      if (dur === Infinity || isNaN(dur) || dur <= 0) {
        setIsLive(true);
        setDuration(0);
      } else {
        setIsLive(false);
        setDuration(dur);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const mediaErr = video.error;
      let msg = 'Failed to load video';
      let help = 'Check that the URL is accessible and supports browser playback.';

      if (mediaErr) {
        if (mediaErr.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          msg = 'Format or Source Not Supported';
          help =
            'The stream format or codec (e.g. MPEG-2/AC-3) is unsupported, or the server blocked access (CORS / Mixed Content).';
        } else if (mediaErr.code === MediaError.MEDIA_ERR_NETWORK) {
          msg = 'Network Connection Interrupted';
          help = 'Network failure while fetching stream chunks.';
        }
      }

      setErrorMessage(msg);
      setErrorHelp(help);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [streamUrl]);

  // Controls actions
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.warn);
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(console.warn);
    } else {
      document.exitFullscreen?.().catch(console.warn);
    }
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP failed:', err);
    }
  };

  const cycleAspectRatio = () => {
    const modes: AspectRatio[] = ['contain', 'cover', 'fill'];
    const next = modes[(modes.indexOf(aspectRatio) + 1) % modes.length];
    setAspectRatio(next);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettingsMenu(false);
  };

  const changeQualityLevel = (lvlId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlId;
      setCurrentLevel(lvlId);
    }
    setShowSettingsMenu(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'p':
          e.preventDefault();
          togglePip();
          break;
        case 'arrowright':
          e.preventDefault();
          if (videoRef.current && !isLive) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 5);
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          if (videoRef.current && !isLive) {
            videoRef.current.currentTime = Math.max(0, currentTime - 5);
          }
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.min(1, v + 0.05);
            if (videoRef.current) videoRef.current.volume = nv;
            return nv;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.max(0, v - 0.05);
            if (videoRef.current) videoRef.current.volume = nv;
            return nv;
          });
          break;
        default:
          break;
      }
      handleUserActivity();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLive, duration, currentTime, isMuted, volume]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const objectFitClass =
    aspectRatio === 'cover'
      ? 'object-cover'
      : aspectRatio === 'fill'
      ? 'object-fill'
      : 'object-contain';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl select-none group ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-video'
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        className={`w-full h-full ${objectFitClass} cursor-pointer transition-all duration-200`}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
      />

      {/* Top Overlay: Title & Channel Info */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {channelLogo ? (
            <img
              src={channelLogo}
              alt=""
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0"
              onError={(e) => {
                // Hide broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Tv className="w-4 h-4 text-cyan-400" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-white truncate drop-shadow">
              {channelTitle || 'Online Stream'}
            </h3>
            <p className="text-xs text-neutral-300 truncate font-mono opacity-80 max-w-xs sm:max-w-md">
              {streamUrl}
            </p>
          </div>
        </div>

        {/* Live Badge or Aspect Ratio Indicator */}
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              LIVE
            </div>
          )}
          <button
            onClick={cycleAspectRatio}
            className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white uppercase transition-colors"
            title="Cycle Aspect Ratio (Contain, Cover, Stretch)"
          >
            {aspectRatio}
          </button>
        </div>
      </div>

      {/* Center Action Overlay: Big Play Button when Paused or Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-2 drop-shadow-lg" />
          <p className="text-white text-xs font-medium tracking-wide">Buffering Stream...</p>
        </div>
      )}

      {!isPlaying && !isLoading && !errorMessage && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Error Overlay with Actionable Diagnostics */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 p-6 z-30 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-white font-bold text-base sm:text-lg mb-1">{errorMessage}</h4>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mb-5 leading-relaxed">
            {errorHelp}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                setErrorMessage(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play().catch(console.warn);
                }
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Retry Stream
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Progress Bar (VOD Only) */}
        {!isLive && duration > 0 && (
          <div className="relative w-full flex items-center group/scrub">
            {/* Background Track */}
            <div className="relative w-full h-1.5 sm:h-2 bg-neutral-800 rounded-full overflow-hidden cursor-pointer">
              {/* Buffered Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-neutral-600/60 rounded-full transition-all"
                style={{ width: `${(bufferedEnd / duration) * 100}%` }}
              />
              {/* Played Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-cyan-400 rounded-full shadow-lg"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            {/* Invisible Range Scrubber */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-4"
              title="Seek time"
            />
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          {/* Left Controls: Play/Pause, Skip Channel, Volume, Timecode */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Prev/Next Channel (if playlist loaded) */}
            {hasPrevChannel && (
              <button
                onClick={onPrevChannel}
                className="p-1.5 rounded-lg hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Previous Channel"
              >
                <Radio className="w-4 h-4 rotate-180" />
              </button>
            )}
            {hasNextChannel && (
              <button
                onClick={onNextChannel}
                className="p-1.5 rounded-lg hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Next Channel"
              >
                <Radio className="w-4 h-4" />
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1.5 accent-cyan-400 bg-neutral-700 rounded-lg cursor-pointer transition-all"
                title="Volume"
              />
            </div>

            {/* Timecode */}
            <div className="text-xs sm:text-sm font-mono text-neutral-300 whitespace-nowrap ml-1">
              {isLive ? (
                <span className="text-cyan-400 font-bold">LIVE ({formatTime(currentTime)})</span>
              ) : (
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>
          </div>

          {/* Right Controls: Quality/Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Settings Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-2 rounded-lg hover:bg-white/20 transition-colors ${
                  showSettingsMenu ? 'bg-white/20 text-cyan-400' : 'text-white'
                }`}
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Flyout Settings Menu */}
              {showSettingsMenu && (
                <div className="absolute right-0 bottom-12 w-52 bg-neutral-900/95 border border-neutral-700/80 rounded-xl shadow-2xl p-3 text-xs flex flex-col gap-3 z-50 backdrop-blur-md">
                  {/* Quality selector for HLS */}
                  {videoLevels.length > 0 && (
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                        Quality
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => changeQualityLevel(-1)}
                          className={`px-2 py-1 rounded text-center font-bold ${
                            currentLevel === -1
                              ? 'bg-cyan-500 text-black'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          }`}
                        >
                          Auto
                        </button>
                        {videoLevels.map((lvl) => (
                          <button
                            key={lvl.id}
                            onClick={() => changeQualityLevel(lvl.id)}
                            className={`px-2 py-1 rounded text-center font-bold ${
                              currentLevel === lvl.id
                                ? 'bg-cyan-500 text-black'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {lvl.height}p
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playback Speed */}
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                      Speed
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-2 py-1 rounded text-center font-bold ${
                            playbackRate === rate
                              ? 'bg-cyan-500 text-black'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            {isPipAvailable && (
              <button
                onClick={togglePip}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors hidden sm:block"
                title="Picture in Picture (P)"
              >
                <PictureInPicture className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
