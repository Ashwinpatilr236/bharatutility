import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { AspectRatio } from './types';

export interface VideoPlayerProps {
  streamUrl: string;
  aspectRatio?: AspectRatio;
  onHlsReady?: (hls: Hls) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onError?: (error: string) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ streamUrl, aspectRatio = 'cover', onHlsReady, onPlayStateChange, onError }, ref) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !streamUrl) return;

      let hlsInstance: Hls | null = null;
      let isCleanedUp = false;

      const playVideo = () => {
        if (isCleanedUp || !video) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!isCleanedUp && onPlayStateChange) onPlayStateChange(true);
            })
            .catch((err) => {
              console.warn('Autoplay with sound prevented, attempting muted playback:', err);
              video.muted = true;
              video
                .play()
                .then(() => {
                  if (!isCleanedUp && onPlayStateChange) onPlayStateChange(true);
                })
                .catch((e) => {
                  console.error('Muted playback also failed:', e);
                  if (!isCleanedUp && onPlayStateChange) onPlayStateChange(false);
                });
            });
        }
      };

      const handlePlay = () => onPlayStateChange && onPlayStateChange(true);
      const handlePause = () => onPlayStateChange && onPlayStateChange(false);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isCleanedUp) {
            if (onHlsReady && hlsInstance) onHlsReady(hlsInstance);
            playVideo();
          }
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal && hlsInstance) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('HLS Network error, attempting recovery...');
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('HLS Media error, attempting recovery...');
                hlsInstance.recoverMediaError();
                break;
              default:
                console.warn('Fatal HLS error, switching to direct video src...');
                hlsInstance.destroy();
                hlsInstance = null;
                if (!isCleanedUp) {
                  video.src = streamUrl;
                  playVideo();
                }
                break;
            }
          }
        });
      } else if (
        video.canPlayType('application/vnd.apple.mpegurl') ||
        video.canPlayType('video/mp4')
      ) {
        // Safari native HLS & direct MP4 fallback
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playVideo);
      } else {
        video.src = streamUrl;
        playVideo();
      }

      return () => {
        isCleanedUp = true;
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('loadedmetadata', playVideo);

        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }

        // Clean video element to release media decoder & memory
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch {
          // ignore cleanup errors
        }
      };
    }, [streamUrl]);

    // CSS class for aspect ratio
    const objectFitClass =
      aspectRatio === 'contain'
        ? 'object-contain'
        : aspectRatio === 'fill'
        ? 'object-fill'
        : 'object-cover';

    return (
      <video
        ref={videoRef}
        className={`w-full h-full transition-all duration-300 ${objectFitClass}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          backgroundColor: '#000000',
        }}
        autoPlay
        playsInline
        controls={false}
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
