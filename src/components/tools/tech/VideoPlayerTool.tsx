import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Tv,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  Sliders,
  Settings,
  Search,
  Grid,
  Menu,
  Heart,
  Clock,
  Radio,
  Sparkles,
  Info,
  CheckCircle2,
  Upload,
  RefreshCw,
  Film,
  X,
  Bookmark
} from 'lucide-react';
import VideoPlayer from './videoplayer/VideoPlayer';
import { EpgGrid } from './videoplayer/EpgGrid';
import { IptvMiniGuide } from './videoplayer/IptvMiniGuide';
import { IptvCategoryDrawer } from './videoplayer/IptvCategoryDrawer';
import { IptvSearchOverlay } from './videoplayer/IptvSearchOverlay';
import { IptvDthZappingOverlay } from './videoplayer/IptvDthZappingOverlay';
import { IptvVolumeOsd } from './videoplayer/IptvVolumeOsd';
import { IptvPlayerSettingsOverlay } from './videoplayer/IptvPlayerSettingsOverlay';
import { IptvSettingsModal } from './videoplayer/IptvSettingsModal';
import { IptvIntroScreen } from './videoplayer/IptvIntroScreen';
import { parseM3u } from './videoplayer/m3uParser';
import { parseXMLTV, EpgDataMap } from './videoplayer/epgParser';
import { ChannelItem, AspectRatio, SampleStream, XtreamCredentials, StalkerCredentials, IptvSourceType } from './videoplayer/types';
import { ArrjsTvLogo } from './videoplayer/ArrjsTvLogo';
import { fetchXtreamChannels } from './videoplayer/xtreamClient';
import { fetchStalkerChannels } from './videoplayer/stalkerClient';
import { useSpatialNavigation, isTvBackKey } from './videoplayer/useSpatialNavigation';
import { IptvConstructionNotice } from './videoplayer/IptvConstructionNotice';
import './videoplayer/iptvStyles.css';

// Default authentic public test channels
const DEFAULT_MOCK_CHANNELS: ChannelItem[] = [
  {
    id: 147,
    name: 'Tears of Steel (1080p FHD)',
    logo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&auto=format&fit=crop&q=80',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    group: 'Sci-Fi & Movies',
    tvgId: 'tears-of-steel',
  },
  {
    id: 148,
    name: 'Big Buck Bunny (720p HD)',
    logo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&auto=format&fit=crop&q=80',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    group: 'Animation',
    tvgId: 'big-buck-bunny',
  },
  {
    id: 149,
    name: 'Sintel 4K Cinema Broadcast',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=80',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    group: 'Cinema & 4K',
    tvgId: 'sintel-4k',
  },
  {
    id: 150,
    name: 'Blender Studio Stream (FHD)',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    group: 'Animation',
    tvgId: 'blender-studio',
  },
];

const SAMPLE_IPTV_STREAMS: SampleStream[] = [
  {
    name: 'Tears of Steel (Adaptive HLS)',
    type: 'hls',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    description: 'Unified Streaming open-source cinematic benchmark in 1080p FHD',
    format: 'HLS .m3u8',
  },
  {
    name: 'Big Buck Bunny (Multi-Bitrate HLS)',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    description: 'Mux adaptive bitrate multi-resolution test stream',
    format: 'HLS .m3u8',
  },
  {
    name: 'Sintel Open Movie (Akamai HLS)',
    type: 'hls',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    description: 'Blender Foundation animated feature stream with alternate audio',
    format: 'HLS .m3u8',
  },
  {
    name: 'Akamai Multi-Bitrate Benchmark Stream',
    type: 'hls',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    description: 'Akamai live HLS test stream across multiple resolution profiles',
    format: 'HLS .m3u8',
  },
];
interface VideoPlayerToolProps {
  onExitToHome?: () => void;
}

export const VideoPlayerTool: React.FC<VideoPlayerToolProps> = ({ onExitToHome }) => {
  // Main channels & categories state
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Recently Viewed', 'All', 'Favorites']);
  const [activeCategory, setActiveCategory] = useState<number>(1); // 'All'
  const [activeChannel, setActiveChannel] = useState<number>(0);
  const [playingChannelData, setPlayingChannelData] = useState<ChannelItem | null>(null);

  // Persistence: Favorites & Play counts
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('iptv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('iptv_play_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Top 8 most played channels for "Recently Viewed"
  const recentChannels = Object.entries(playCounts)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([id]) => id)
    .slice(0, 8);

  // EPG & Playlist URL state
  const [playlistUrl, setPlaylistUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('iptv_playlist_url') || '';
    } catch {
      return '';
    }
  });
  const [epgUrl, setEpgUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('iptv_epg_url') || '';
    } catch {
      return '';
    }
  });
  const [sourceName, setSourceName] = useState<string>(() => {
    try {
      return localStorage.getItem('iptv_source_name') || '';
    } catch {
      return '';
    }
  });
  const [sourceType, setSourceType] = useState<IptvSourceType>(() => {
    try {
      const savedType = localStorage.getItem('iptv_source_type');
      if (savedType === 'remote' || savedType === 'local' || savedType === 'xtream' || savedType === 'stalker' || savedType === 'mock') return savedType as IptvSourceType;
      if (localStorage.getItem('iptv_xtream_server')) return 'xtream';
      if (localStorage.getItem('iptv_stalker_url')) return 'stalker';
      if (localStorage.getItem('iptv_playlist_url')) return 'remote';
      if (localStorage.getItem('iptv_channels')) return 'local';
      return 'mock';
    } catch {
      return 'mock';
    }
  });

  // Xtream Codes Credentials State
  const [xtreamCredentials, setXtreamCredentials] = useState<XtreamCredentials | null>(() => {
    try {
      const s = localStorage.getItem('iptv_xtream_server');
      const u = localStorage.getItem('iptv_xtream_user');
      const p = localStorage.getItem('iptv_xtream_pass');
      return s && u && p ? { serverUrl: s, username: u, password: p } : null;
    } catch {
      return null;
    }
  });

  // Stalker Portal Credentials State
  const [stalkerCredentials, setStalkerCredentials] = useState<StalkerCredentials | null>(() => {
    try {
      const url = localStorage.getItem('iptv_stalker_url');
      const mac = localStorage.getItem('iptv_stalker_mac');
      return url && mac ? { portalUrl: url, macAddress: mac } : null;
    } catch {
      return null;
    }
  });

  const [epgData, setEpgData] = useState<EpgDataMap>({});
  const [loading, setLoading] = useState<boolean>(false);

  // UI Overlays state
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showEpg, setShowEpg] = useState<boolean>(false);
  const [showMiniGuide, setShowMiniGuide] = useState<boolean>(true);
  const [showPlayerSettings, setShowPlayerSettings] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('cover');

  // D-Pad Focus Navigation state for Drawer & Channels
  const [focusedPane, setFocusedPane] = useState<'drawer' | 'channels'>('drawer');
  const [focusedChannelIndex, setFocusedChannelIndex] = useState<number>(0);
  const focusedChannelItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll focused channel into view
  useEffect(() => {
    if (focusedPane === 'channels' && focusedChannelItemRef.current) {
      focusedChannelItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [focusedPane, focusedChannelIndex]);

  // When drawer opens, reset focus to drawer
  useEffect(() => {
    if (showDrawer) {
      setFocusedPane('drawer');
      setFocusedChannelIndex(0);
    }
  }, [showDrawer]);

  // Smart TV Back-press exit confirmation state
  const [showExitConfirmToast, setShowExitConfirmToast] = useState<boolean>(false);
  const exitConfirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-Fullscreen Trigger on First User Interaction (any key, click, or touch)
  useEffect(() => {
    let triggered = false;

    const handleFirstGesture = () => {
      if (triggered) return;
      triggered = true;

      if (!document.fullscreenElement) {
        const target = tvContainerRef.current || document.documentElement;
        if (target && target.requestFullscreen) {
          target.requestFullscreen().catch(() => {});
        }
      }

      window.removeEventListener('keydown', handleFirstGesture, true);
      window.removeEventListener('click', handleFirstGesture, true);
      window.removeEventListener('touchstart', handleFirstGesture, true);
    };

    window.addEventListener('keydown', handleFirstGesture, true);
    window.addEventListener('click', handleFirstGesture, true);
    window.addEventListener('touchstart', handleFirstGesture, true);

    return () => {
      window.removeEventListener('keydown', handleFirstGesture, true);
      window.removeEventListener('click', handleFirstGesture, true);
      window.removeEventListener('touchstart', handleFirstGesture, true);
    };
  }, []);

  // Playback & Sound State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeOsd, setShowVolumeOsd] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Digital clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Player Engine references
  const tvContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [videoLevels, setVideoLevels] = useState<{ height: number; bitrate?: number }[]>([]);
  const [audioTracks, setAudioTracks] = useState<{ id: number; name?: string; language?: string }[]>([]);
  const [currentVideoLevel, setCurrentVideoLevel] = useState<number>(-1);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);

  // DTH Channel Zapping state
  const [typedChannelNumber, setTypedChannelNumber] = useState<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typedChannelNumberRef = useRef<string>('');
  useEffect(() => {
    typedChannelNumberRef.current = typedChannelNumber;
  }, [typedChannelNumber]);

  // Touch gesture state
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  // Track channel play counts
  useEffect(() => {
    if (playingChannelData && playingChannelData.id !== undefined) {
      setPlayCounts((prev) => {
        const key = playingChannelData.id.toString();
        const updated = { ...prev, [key]: (prev[key] || 0) + 1 };
        try {
          localStorage.setItem('iptv_play_counts', JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
        return updated;
      });
    }
  }, [playingChannelData]);

  // Load saved channels / EPG on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('iptv_channels');
    const savedEpgUrl = localStorage.getItem('iptv_epg_url');
    const savedPlaylistUrl = localStorage.getItem('iptv_playlist_url');
    const savedSourceName = localStorage.getItem('iptv_source_name');
    const savedSourceType = localStorage.getItem('iptv_source_type');

    if (savedPlaylistUrl) {
      setPlaylistUrl(savedPlaylistUrl);
    }
    if (savedSourceName) {
      setSourceName(savedSourceName);
    }
    if (savedSourceType === 'remote' || savedSourceType === 'local' || savedSourceType === 'xtream' || savedSourceType === 'stalker' || savedSourceType === 'mock') {
      setSourceType(savedSourceType as IptvSourceType);
    } else if (localStorage.getItem('iptv_xtream_server')) {
      setSourceType('xtream');
    } else if (localStorage.getItem('iptv_stalker_url')) {
      setSourceType('stalker');
    } else if (savedPlaylistUrl) {
      setSourceType('remote');
      setSourceName(savedPlaylistUrl);
    } else if (savedChannels) {
      setSourceType('local');
      setSourceName(savedSourceName || 'Local M3U File');
    }

    if (savedEpgUrl) {
      setEpgUrl(savedEpgUrl);
      fetchEpgData(savedEpgUrl);
    }

    if (savedChannels) {
      try {
        const parsed = JSON.parse(savedChannels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadChannelsIntoState(parsed);
          return;
        }
      } catch (err) {
        console.warn('Error reading cached channels:', err);
      }
    }

    // Default to mock channels if nothing cached
    loadChannelsIntoState(DEFAULT_MOCK_CHANNELS);
  }, []);

  const loadChannelsIntoState = (chanList: ChannelItem[]) => {
    setChannels(chanList);
    // Extract unique categories
    const cats = ['Recently Viewed', 'All', 'Favorites'];
    chanList.forEach((c) => {
      if (c.group && !cats.includes(c.group)) {
        cats.push(c.group);
      }
    });
    setCategories(cats);

    if (!playingChannelData && chanList.length > 0) {
      setPlayingChannelData(chanList[0]);
      setActiveChannel(0);
    }
  };

  // Safe EPG fetcher (Wrapped to prevent SyntheticEvent issues)
  const fetchEpgData = async (targetUrl?: string) => {
    const urlToFetch = typeof targetUrl === 'string' ? targetUrl : epgUrl;
    if (!urlToFetch || typeof urlToFetch !== 'string') return;

    try {
      const response = await fetch(urlToFetch);
      if (!response.ok) return;
      const text = await response.text();
      const parsedEpg = parseXMLTV(text);
      setEpgData(parsedEpg);
    } catch (err) {
      console.warn('Failed to fetch EPG XMLTV data:', err);
    }
  };

  // Favorite toggle
  const toggleFavorite = (channelId: string | number) => {
    setFavorites((prev) => {
      const exists = prev.some((id) => id.toString() === channelId.toString());
      const updated = exists
        ? prev.filter((id) => id.toString() !== channelId.toString())
        : [...prev, channelId];
      try {
        localStorage.setItem('iptv_favorites', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
  };

  // Trigger Volume OSD HUD
  const triggerVolumeOsd = () => {
    setShowVolumeOsd(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeOsd(false);
    }, 2800);
  };

  // Mini-guide auto-hide after 8s of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (
      !showSettings &&
      !showPlayerSettings &&
      showMiniGuide &&
      !showEpg &&
      !showDrawer &&
      !showSearch
    ) {
      timeout = setTimeout(() => {
        setShowMiniGuide(false);
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [showMiniGuide, showEpg, showDrawer, showSettings, showPlayerSettings, showSearch]);

  // Top HUD Bar auto-hide after 10s of inactivity
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const topBarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTopBarTimeout = useCallback(() => {
    setShowTopBar(true);
    if (topBarTimeoutRef.current) clearTimeout(topBarTimeoutRef.current);
    topBarTimeoutRef.current = setTimeout(() => {
      setShowTopBar(false);
    }, 10000); // 10 seconds auto-hide as requested
  }, []);

  useEffect(() => {
    // Keep top bar visible if any drawer, modal or EPG is open
    if (showDrawer || showEpg || showSettings || showPlayerSettings || showSearch) {
      setShowTopBar(true);
      if (topBarTimeoutRef.current) clearTimeout(topBarTimeoutRef.current);
      return;
    }

    // Start 10s timer
    resetTopBarTimeout();

    const handleUserActivity = () => {
      resetTopBarTimeout();
    };

    const container = tvContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleUserActivity);
      container.addEventListener('touchstart', handleUserActivity);
    }
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      if (topBarTimeoutRef.current) clearTimeout(topBarTimeoutRef.current);
      if (container) {
        container.removeEventListener('mousemove', handleUserActivity);
        container.removeEventListener('touchstart', handleUserActivity);
      }
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [showDrawer, showEpg, showSettings, showPlayerSettings, showSearch, resetTopBarTimeout]);

  // TV Remote "Toolbar Mode": Back (with nothing open) focuses the top HUD buttons
  // so Settings / Guide / Bookmark / Fullscreen are reachable with only arrows + OK.
  const [toolbarFocus, setToolbarFocus] = useState<boolean>(false);
  const topBarRef = useRef<HTMLDivElement>(null);

  const exitToolbarMode = useCallback(() => {
    setToolbarFocus(false);
    const active = document.activeElement as HTMLElement | null;
    if (active && topBarRef.current?.contains(active)) active.blur();
  }, []);

  useSpatialNavigation(topBarRef, {
    enabled: toolbarFocus,
    autoFocus: true,
    onBack: exitToolbarMode,
    onEdge: (dir) => {
      if (dir === 'down') {
        exitToolbarMode();
        return true;
      }
      return true; // stay inside toolbar on other edges
    },
  });

  useEffect(() => {
    if (toolbarFocus) {
      setShowTopBar(true);
      if (topBarTimeoutRef.current) clearTimeout(topBarTimeoutRef.current);
    }
  }, [toolbarFocus]);

  useEffect(() => {
    // Leave toolbar mode as soon as any panel opens (e.g. user pressed OK on Settings)
    if (showDrawer || showEpg || showSettings || showPlayerSettings || showSearch) {
      setToolbarFocus(false);
    }
  }, [showDrawer, showEpg, showSettings, showPlayerSettings, showSearch]);

  // Smart TV Unified Back Action Handler
  const handleSmartTvBack = useCallback(() => {
    // Priority 1: Settings Modal
    if (showSettings) {
      setShowSettings(false);
      return;
    }
    // Priority 2: Player Quality / Audio Settings Overlay
    if (showPlayerSettings) {
      setShowPlayerSettings(false);
      return;
    }
    // Priority 3: Search Overlay
    if (showSearch) {
      setShowSearch(false);
      return;
    }
    // Priority 4: EPG Schedule Grid
    if (showEpg) {
      setShowEpg(false);
      return;
    }
    // Priority 5: Category Drawer / Channel Shelf
    if (showDrawer) {
      if (focusedPane === 'channels') {
        // Move focus from channels grid back to category drawer on the left
        setFocusedPane('drawer');
      } else {
        // Close category drawer
        setShowDrawer(false);
      }
      return;
    }
    // Priority 6: MiniGuide HUD
    if (showMiniGuide) {
      setShowMiniGuide(false);
      return;
    }
    // Priority 7: Toolbar Focus mode
    if (toolbarFocus) {
      exitToolbarMode();
      return;
    }

    // Priority 8: Video is playing and nothing is open
    // Accidental Back-Press Protection: Do NOT let the browser exit or close the tab!
    // Prompt the user: "Press Back again to exit player"
    if (showExitConfirmToast) {
      // Confirmed exit on second back press within 3.5s!
      setShowExitConfirmToast(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (onExitToHome) {
        onExitToHome();
      } else {
        window.location.href = '/';
      }
    } else {
      setShowExitConfirmToast(true);
      if (exitConfirmTimeoutRef.current) clearTimeout(exitConfirmTimeoutRef.current);
      exitConfirmTimeoutRef.current = setTimeout(() => {
        setShowExitConfirmToast(false);
      }, 3500);
    }
  }, [
    showSettings,
    showPlayerSettings,
    showSearch,
    showEpg,
    showDrawer,
    focusedPane,
    showMiniGuide,
    toolbarFocus,
    exitToolbarMode,
    showExitConfirmToast,
    onExitToHome,
  ]);

  // Trap browser history popstate so TV remote back button stays inside player
  useEffect(() => {
    try {
      window.history.pushState({ iptvModalTrap: true }, '', window.location.href);
    } catch {}

    const handlePopState = () => {
      try {
        window.history.pushState({ iptvModalTrap: true }, '', window.location.href);
      } catch {}
      handleSmartTvBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleSmartTvBack]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (tvContainerRef.current) {
        tvContainerRef.current.requestFullscreen().catch(() => {
          document.documentElement.requestFullscreen().catch(() => {});
        });
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Picture in Picture toggle
  const togglePip = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.requestPictureInPicture().catch(() => {});
    }
  };

  // Cycle aspect ratios
  const cycleAspectRatio = () => {
    const modes: AspectRatio[] = ['cover', 'contain', 'fill'];
    const nextMode = modes[(modes.indexOf(aspectRatio) + 1) % modes.length];
    setAspectRatio(nextMode);
  };

  // HLS stream ready handler
  const handleHlsReady = (hls: Hls) => {
    hlsRef.current = hls;
    if (hls.levels) {
      setVideoLevels(hls.levels.map((lvl, idx) => ({ height: lvl.height || 720, bitrate: lvl.bitrate })));
      setCurrentVideoLevel(hls.currentLevel);
    }
    if (hls.audioTracks) {
      setAudioTracks(hls.audioTracks);
      setCurrentAudioTrack(hls.audioTrack);
    }

    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      setCurrentVideoLevel(data.level);
    });
    hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_event, data) => {
      setCurrentAudioTrack(data.id);
    });
  };

  const handleSetQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentVideoLevel(levelIndex);
    }
  };

  const handleSetAudio = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
    }
  };

  // Filter channels based on active category
  const activeCategoryName = categories[activeCategory] || 'All';
  let filteredChannels: ChannelItem[] = [];

  if (activeCategoryName === 'All') {
    filteredChannels = channels;
  } else if (activeCategoryName === 'Favorites') {
    filteredChannels = channels.filter((c) =>
      favorites.some((favId) => favId.toString() === c.id.toString())
    );
  } else if (activeCategoryName === 'Recently Viewed') {
    filteredChannels = channels
      .filter((c) => recentChannels.includes(c.id.toString()))
      .sort((a, b) => recentChannels.indexOf(a.id.toString()) - recentChannels.indexOf(b.id.toString()));
  } else {
    filteredChannels = channels.filter((c) => c.group === activeCategoryName);
  }

  const displayChannels =
    filteredChannels.length > 0
      ? filteredChannels
      : channels.length > 0
      ? channels
      : DEFAULT_MOCK_CHANNELS;

  const currentChannelData = playingChannelData || displayChannels[0];
  const focusedChannelData = displayChannels[activeChannel] || displayChannels[0];

  // Channel switching
  const handleSelectChannel = (channel: ChannelItem, index?: number) => {
    setPlayingChannelData(channel);
    if (index !== undefined) {
      setActiveChannel(index);
    } else {
      const idx = displayChannels.findIndex((c) => c.id.toString() === channel.id.toString());
      if (idx !== -1) setActiveChannel(idx);
    }
    setShowMiniGuide(true);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.changedTouches[0].screenY;
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].screenY;
    const endX = e.changedTouches[0].screenX;
    const deltaY = endY - touchStartY.current;
    const deltaX = endX - touchStartX.current;

    // Horizontal swipe: Open / Close Menus
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe Right -> Open Categories
        setShowDrawer(true);
      } else {
        // Swipe Left -> Dismiss all UI
        setShowDrawer(false);
        setShowEpg(false);
        setShowMiniGuide(false);
        setShowPlayerSettings(false);
        setShowSettings(false);
      }
    }
  };

  // TV remote & Keyboard navigation listener
  useEffect(() => {
    // Intro, settings modal, player-settings overlay and toolbar mode have their own D-pad handling
    if (showSettings || showIntro || showPlayerSettings || toolbarFocus) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const isBack = isTvBackKey(e) || e.key === 'Backspace';
      const keyCode = (e as KeyboardEvent & { keyCode: number }).keyCode;

      // Allow searching input without triggering shortcuts
      if (showSearch && !isBack) return;

      // Don't trigger if user is typing in an input element
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Grid columns match the responsive channel grid (2 on phones, 4 on tablets / TVs)
      const cols = window.innerWidth >= 640 ? 4 : 2;

      // Back / Return (Escape, Backspace, Tizen 10009, webOS 461, Android 4)
      if (isBack) {
        e.preventDefault();
        e.stopPropagation();
        handleSmartTvBack();
        return;
      }

      // Dedicated TV remote media / channel keys
      if (e.key === 'ChannelUp' || keyCode === 427 || e.key === 'PageUp') {
        e.preventDefault();
        const nextIdx = (activeChannel + 1) % displayChannels.length;
        setActiveChannel(nextIdx);
        setPlayingChannelData(displayChannels[nextIdx]);
        setShowMiniGuide(true);
        return;
      }
      if (e.key === 'ChannelDown' || keyCode === 428 || e.key === 'PageDown') {
        e.preventDefault();
        const prevIdx = (activeChannel - 1 + displayChannels.length) % displayChannels.length;
        setActiveChannel(prevIdx);
        setPlayingChannelData(displayChannels[prevIdx]);
        setShowMiniGuide(true);
        return;
      }
      if (
        e.key === 'MediaPlayPause' || e.key === 'MediaPlay' || e.key === 'MediaPause' ||
        keyCode === 10252 || keyCode === 415 || keyCode === 19
      ) {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
        return;
      }

      // Wake up mini-guide on interactive keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key) ||
        (e.key >= '0' && e.key <= '9')
      ) {
        setShowMiniGuide(true);
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (showDrawer) {
            if (focusedPane === 'channels') {
              setFocusedChannelIndex((prev) => (prev >= cols ? prev - cols : prev));
            } else {
              setActiveCategory((prev) => (prev > 0 ? prev - 1 : categories.length - 1));
              setFocusedChannelIndex(0);
            }
          } else if (showEpg) {
            setActiveChannel((prev) => (prev > 0 ? prev - 1 : displayChannels.length - 1));
          } else {
            // Next channel
            const nextIdx = (activeChannel + 1) % displayChannels.length;
            setActiveChannel(nextIdx);
            setPlayingChannelData(displayChannels[nextIdx]);
            setShowMiniGuide(true);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (showDrawer) {
            if (focusedPane === 'channels') {
              setFocusedChannelIndex((prev) => Math.min(displayChannels.length - 1, prev + cols));
            } else {
              setActiveCategory((prev) => (prev < categories.length - 1 ? prev + 1 : 0));
              setFocusedChannelIndex(0);
            }
          } else if (showEpg) {
            setActiveChannel((prev) => (prev < displayChannels.length - 1 ? prev + 1 : 0));
          } else {
            // Previous channel
            const prevIdx = (activeChannel - 1 + displayChannels.length) % displayChannels.length;
            setActiveChannel(prevIdx);
            setPlayingChannelData(displayChannels[prevIdx]);
            setShowMiniGuide(true);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (showDrawer) {
            if (focusedPane === 'channels') {
              if (focusedChannelIndex % cols === 0) {
                // At leftmost column, return focus to categories drawer
                setFocusedPane('drawer');
              } else {
                setFocusedChannelIndex((prev) => prev - 1);
              }
            }
          } else if (showEpg && !showDrawer) {
            setShowDrawer(true);
            setFocusedPane('drawer');
          } else if (!showDrawer) {
            setShowDrawer(true);
            setFocusedPane('drawer');
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (showDrawer) {
            if (focusedPane === 'drawer') {
              // Move focus to channels on the right
              setFocusedPane('channels');
              setFocusedChannelIndex(0);
            } else {
              setFocusedChannelIndex((prev) => Math.min(displayChannels.length - 1, prev + 1));
            }
          } else if (!showEpg) {
            setShowEpg(true);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (showDrawer) {
            if (focusedPane === 'drawer') {
              // Enter on category moves focus to channels on the right
              setFocusedPane('channels');
              setFocusedChannelIndex(0);
            } else {
              // Enter on channel plays the channel immediately!
              const targetChan = displayChannels[focusedChannelIndex];
              if (targetChan) {
                handleSelectChannel(targetChan);
                setShowDrawer(false);
                setShowEpg(false);
              }
            }
          } else if (typedChannelNumberRef.current) {
            const typed = typedChannelNumberRef.current;
            const targetChannelIndex = displayChannels.findIndex(
              (c) => c.id && c.id.toString() === typed
            );
            const fallbackIndex = displayChannels.findIndex(
              (_, idx) => (idx + 1).toString() === typed
            );
            const finalIdx = targetChannelIndex !== -1 ? targetChannelIndex : fallbackIndex;

            if (finalIdx !== -1) {
              setActiveChannel(finalIdx);
              setPlayingChannelData(displayChannels[finalIdx]);
            }
            setTypedChannelNumber('');
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          } else if (showEpg) {
            setPlayingChannelData(displayChannels[activeChannel]);
            setShowEpg(false);
            setShowMiniGuide(true);
          } else if (!showMiniGuide) {
            setShowMiniGuide(true);
          }
          break;

        case ' ': // Space: Play/Pause
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
          break;

        case 'f': // Fullscreen
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'p': // Picture in Picture
        case 'P':
          e.preventDefault();
          togglePip();
          break;

        case 'g': // TV Guide / EPG
        case 'G':
          e.preventDefault();
          setShowEpg((prev) => !prev);
          break;

        case 'c': // Category Drawer
        case 'C':
          e.preventDefault();
          setShowDrawer((prev) => !prev);
          break;

        case 'o': // Player Settings
        case 'O':
          e.preventDefault();
          setShowPlayerSettings((prev) => !prev);
          break;

        case 's': // Playlist Settings
        case 'S':
          e.preventDefault();
          setShowSettings(true);
          break;

        case '/': // Search
          e.preventDefault();
          setShowSearch(true);
          break;

        case 'm': // Mute
        case 'M':
          e.preventDefault();
          setIsMuted((prev) => {
            const nextMuted = !prev;
            if (videoRef.current) videoRef.current.muted = nextMuted;
            return nextMuted;
          });
          triggerVolumeOsd();
          break;

        case '=': // Volume up
        case '+':
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.min(1, Math.round((v + 0.1) * 10) / 10);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              videoRef.current.muted = false;
            }
            return newVol;
          });
          setIsMuted(false);
          triggerVolumeOsd();
          break;

        case '-': // Volume down
        case '_':
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.max(0, Math.round((v - 0.1) * 10) / 10);
            if (videoRef.current) {
              videoRef.current.volume = newVol;
              videoRef.current.muted = false;
            }
            return newVol;
          });
          setIsMuted(false);
          triggerVolumeOsd();
          break;

        default:
          // Numeric channel tuning (0-9)
          if (e.key >= '0' && e.key <= '9') {
            if (typedChannelNumberRef.current.length >= 4) return;
            const newTyped = typedChannelNumberRef.current + e.key;
            setTypedChannelNumber(newTyped);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              const targetIdx = displayChannels.findIndex(
                (c) => c.id && c.id.toString() === newTyped
              );
              const fallbackIdx = displayChannels.findIndex(
                (_, idx) => (idx + 1).toString() === newTyped
              );
              const finalIdx = targetIdx !== -1 ? targetIdx : fallbackIdx;

              if (finalIdx !== -1) {
                setActiveChannel(finalIdx);
                setPlayingChannelData(displayChannels[finalIdx]);
                setShowMiniGuide(true);
              }
              setTypedChannelNumber('');
            }, 2000);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDrawer, showEpg, showMiniGuide, showSettings, showPlayerSettings, showSearch, showIntro, toolbarFocus, displayChannels, categories, activeChannel, focusedPane, focusedChannelIndex, resetTopBarTimeout]);

  // Playlist saving & clearing
  const handleSavePlaylistUrl = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const text = await response.text();
      const parsedChannels = parseM3u(text);

      if (parsedChannels.length > 0) {
        localStorage.setItem('iptv_channels', JSON.stringify(parsedChannels));
        localStorage.setItem('iptv_playlist_url', url);
        localStorage.setItem('iptv_source_name', url);
        localStorage.setItem('iptv_source_type', 'remote');
        setPlaylistUrl(url);
        setSourceName(url);
        setSourceType('remote');
        loadChannelsIntoState(parsedChannels);
        setShowSettings(false);
      } else {
        throw new Error('No valid playable channels found in this M3U playlist.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLocalFile = (content: string, fileName: string) => {
    const parsedChannels = parseM3u(content);
    if (parsedChannels.length > 0) {
      const name = fileName || 'Uploaded M3U File';
      localStorage.setItem('iptv_channels', JSON.stringify(parsedChannels));
      localStorage.setItem('iptv_source_name', name);
      localStorage.setItem('iptv_source_type', 'local');
      localStorage.removeItem('iptv_playlist_url');
      setSourceName(name);
      setSourceType('local');
      setPlaylistUrl('');
      loadChannelsIntoState(parsedChannels);
      setShowSettings(false);
    } else {
      alert('Could not find channels in this file. Please verify it is a valid M3U file.');
    }
  };

  const handleClearPlaylist = () => {
    localStorage.removeItem('iptv_channels');
    localStorage.removeItem('iptv_playlist_url');
    localStorage.removeItem('iptv_epg_url');
    localStorage.removeItem('iptv_source_name');
    localStorage.removeItem('iptv_source_type');
    localStorage.removeItem('iptv_xtream_server');
    localStorage.removeItem('iptv_xtream_user');
    localStorage.removeItem('iptv_xtream_pass');
    localStorage.removeItem('iptv_stalker_url');
    localStorage.removeItem('iptv_stalker_mac');
    setXtreamCredentials(null);
    setStalkerCredentials(null);
    setChannels([]);
    setEpgData({});
    setPlaylistUrl('');
    setEpgUrl('');
    setSourceName('');
    setSourceType('mock');
    loadChannelsIntoState(DEFAULT_MOCK_CHANNELS);
  };

  const handleLoginXtream = async (server: string, user: string, pass: string) => {
    setLoading(true);
    try {
      const result = await fetchXtreamChannels(server, user, pass);
      if (!result.success || result.channels.length === 0) {
        throw new Error(
          result.error ||
            'Could not load channels from Xtream server. If your provider blocks direct browser CORS, copy the generated M3U link or download the file and use the Local M3U File tab.'
        );
      }

      localStorage.setItem('iptv_channels', JSON.stringify(result.channels));
      localStorage.setItem('iptv_xtream_server', server);
      localStorage.setItem('iptv_xtream_user', user);
      localStorage.setItem('iptv_xtream_pass', pass);
      const displayName = `Xtream: ${user}@${server.replace(/^https?:\/\//, '')}`;
      localStorage.setItem('iptv_source_name', displayName);
      localStorage.setItem('iptv_source_type', 'xtream');
      localStorage.removeItem('iptv_playlist_url');
      localStorage.removeItem('iptv_stalker_url');
      localStorage.removeItem('iptv_stalker_mac');

      setXtreamCredentials({ serverUrl: server, username: user, password: pass });
      setStalkerCredentials(null);
      setSourceName(displayName);
      setSourceType('xtream');
      setPlaylistUrl(result.m3uUrl);
      loadChannelsIntoState(result.channels);
      setShowSettings(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStalker = async (portalUrl: string, macAddress: string) => {
    setLoading(true);
    try {
      const result = await fetchStalkerChannels(portalUrl, macAddress);
      if (!result.success || result.channels.length === 0) {
        throw new Error(
          result.error ||
            'Failed to connect to Stalker Portal. Ensure your MAC is registered and active on this portal.'
        );
      }

      localStorage.setItem('iptv_channels', JSON.stringify(result.channels));
      localStorage.setItem('iptv_stalker_url', portalUrl);
      localStorage.setItem('iptv_stalker_mac', macAddress);
      const displayName = `Stalker MAG: ${macAddress}`;
      localStorage.setItem('iptv_source_name', displayName);
      localStorage.setItem('iptv_source_type', 'stalker');
      localStorage.removeItem('iptv_playlist_url');
      localStorage.removeItem('iptv_xtream_server');
      localStorage.removeItem('iptv_xtream_user');
      localStorage.removeItem('iptv_xtream_pass');

      setStalkerCredentials({ portalUrl, macAddress });
      setXtreamCredentials(null);
      setSourceName(displayName);
      setSourceType('stalker');
      setPlaylistUrl('');
      loadChannelsIntoState(result.channels);
      setShowSettings(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSampleStream = (sample: SampleStream) => {
    const newChan: ChannelItem = {
      id: Math.floor(Math.random() * 800) + 100,
      name: sample.name,
      url: sample.url,
      group: 'Test Streams',
    };
    setPlayingChannelData(newChan);
    setShowMiniGuide(true);
  };

  const handlePlayDirectUrl = (url: string, name: string) => {
    const newChan: ChannelItem = {
      id: 999,
      name,
      url,
      group: 'Direct Stream',
    };
    setPlayingChannelData(newChan);
    setShowMiniGuide(true);
  };

  // Channel helper for categories
  const getChannelsForCategory = useCallback(
    (categoryIndex: number): ChannelItem[] => {
      const catName = categories[categoryIndex] || 'All';
      if (catName === 'All') return channels;
      if (catName === 'Favorites') {
        return channels.filter((c) =>
          favorites.some((favId) => favId.toString() === c.id.toString())
        );
      }
      if (catName === 'Recently Viewed') {
        return channels
          .filter((c) => recentChannels.includes(c.id.toString()))
          .sort(
            (a, b) =>
              recentChannels.indexOf(a.id.toString()) -
              recentChannels.indexOf(b.id.toString())
          );
      }
      return channels.filter((c) => c.group === catName);
    },
    [categories, channels, favorites, recentChannels]
  );

  // Channel counts for drawer
  const categoryCounts: Record<string, number> = {
    'All': channels.length,
    'Favorites': channels.filter((c) => favorites.some((f) => f.toString() === c.id.toString())).length,
    'Recently Viewed': recentChannels.length,
  };
  channels.forEach((c) => {
    if (c.group) {
      categoryCounts[c.group] = (categoryCounts[c.group] || 0) + 1;
    }
  });

  return (
    <div
      ref={tvContainerRef}
      className="iptv-app-shell relative w-full flex-1 min-h-[320px] bg-black select-none overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Layer -1: Cinematic Intro Screen on Initial Launch */}
      {showIntro && (
        <IptvIntroScreen
          onComplete={() => setShowIntro(false)}
          onRequestFullscreen={toggleFullscreen}
          onRequestOpenSettings={() => {
            setShowIntro(false);
            setShowSettings(true);
          }}
          onSavePlaylistUrl={handleSavePlaylistUrl}
          onLoginXtream={handleLoginXtream}
          onLoginStalker={handleLoginStalker}
        />
      )}

      {/* Layer 0: Pure Video Player Stage */}
      <div
        className="absolute inset-0 z-0 cursor-pointer bg-black"
        onClick={() => {
          resetTopBarTimeout();
          if (!showDrawer && !showEpg && !showMiniGuide) {
            setShowMiniGuide(true);
          } else {
            setShowDrawer(false);
            setShowEpg(false);
            setShowMiniGuide(false);
            setShowPlayerSettings(false);
          }
        }}
      >
        {currentChannelData && (
          <VideoPlayer
            ref={videoRef}
            streamUrl={currentChannelData.url}
            aspectRatio={aspectRatio}
            onHlsReady={handleHlsReady}
            onPlayStateChange={setIsPlaying}
          />
        )}
      </div>

      {/* Layer 1: Top Broadcast Status Bar & Quick Actions (Auto-hides after 10s of inactivity) */}
      <div
        ref={topBarRef}
        className={`absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 z-30 flex items-center justify-between transition-all duration-500 ${
          showTopBar
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        } ${toolbarFocus ? 'iptv-toolbar-active' : ''}`}
        onMouseEnter={() => {
          if (topBarTimeoutRef.current) clearTimeout(topBarTimeoutRef.current);
          setShowTopBar(true);
        }}
        onMouseLeave={resetTopBarTimeout}
      >
        {/* Top Left: Logo & Category Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowDrawer(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-neutral-950/75 hover:bg-neutral-900/90 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 text-white flex items-center gap-2 transition-all active:scale-95 shadow-xl group/btn"
            title="Open Categories (C)"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover/btn:rotate-90 transition-transform" />
            <span className="hidden sm:inline font-bold text-xs tracking-wide">Categories</span>
          </button>

          <div className="hidden md:flex items-center bg-neutral-950/75 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-xl">
            <ArrjsTvLogo size="xs" showText={true} badge="LIVE" subtitle="SMART TV" animated={true} />
          </div>
        </div>

        {/* Global IPTV Status Indicator (Section 9) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] select-none animate-in fade-in duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>ARRJS IPTV • Beta / Under Construction</span>
        </div>

        {/* Top Right: Clock, Search, TV Guide, Playlist Settings, Player Settings, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live Clock Widget */}
          <div className="hidden xs:flex flex-col text-right bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-white shadow-xl">
            <span className="text-cyan-400 font-mono font-bold text-xs sm:text-sm leading-tight tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium leading-none">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Quick Search */}
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-cyan-400 transition-all shadow-xl active:scale-95"
            title="Search Channels (/)"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* TV Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowEpg(!showEpg)}
            className={`p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border transition-all shadow-xl active:scale-95 ${
              showEpg
                ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                : 'bg-black/70 hover:bg-black/90 border-white/20 text-white hover:text-cyan-400'
            }`}
            title="TV Guide EPG (G)"
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => {
              try {
                navigator.clipboard.writeText(window.location.href);
              } catch {}
              alert('⭐ Press Ctrl + D (or ⌘ + D on Mac) to bookmark ARRJS Video Player! (URL copied to clipboard)');
            }}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-cyan-400 transition-all shadow-xl active:scale-95"
            title="Bookmark Player (Ctrl + D)"
          >
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Playlist & M3U Settings Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-cyan-400 transition-all shadow-xl active:scale-95"
            title="Playlist & Stream Settings (S)"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Player Settings (Quality / Audio / Aspect Ratio) */}
          <button
            type="button"
            onClick={() => setShowPlayerSettings(!showPlayerSettings)}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-cyan-400 transition-all shadow-xl active:scale-95"
            title="Player Settings (O)"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white hover:text-cyan-400 transition-all shadow-xl active:scale-95"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Smart TV Fullscreen Prompt Banner (Shown when not in Fullscreen) */}
      {!isFullscreen && (
        <div
          onClick={toggleFullscreen}
          className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/85 hover:bg-neutral-900 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,242,254,0.35)] cursor-pointer text-cyan-300 text-xs font-semibold backdrop-blur-xl transition-all"
        >
          <Maximize className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Click anywhere or Press OK for Fullscreen TV Mode</span>
          <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40 text-white font-mono">
            OK
          </span>
        </div>
      )}

      {/* Layer 2: DTH Numeric Zapping Overlay */}
      <IptvDthZappingOverlay
        typedChannelNumber={typedChannelNumber}
        channels={displayChannels}
      />

      {/* Layer 3: Volume & Mute OSD HUD */}
      <IptvVolumeOsd
        volume={volume}
        isMuted={isMuted}
        isVisible={showVolumeOsd}
      />

      {/* Layer 5: Interactive EPG Schedule Timeline (Bottom) OR Channel Shelf (Top Transparent) */}
      {(showEpg || showDrawer) && (
        (showDrawer || activeCategoryName === 'Recently Viewed') ? (
          /* Top Transparent Channel Shelf / Grid (4 per line) */
          <div
            className={`absolute top-14 sm:top-16 right-0 bottom-4 transition-all duration-300 pointer-events-auto px-4 sm:px-8 py-2 overflow-y-auto overscroll-contain iptv-custom-scrollbar ${
              showDrawer ? 'left-72 sm:left-84 z-50' : 'left-0 z-30'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {displayChannels.length === 0 ? (
              <div className="text-center py-4 text-neutral-300 text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-black/40 max-w-md mx-auto rounded-2xl border border-white/10 p-3">
                No channels found in this category.
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-2 max-w-5xl">
                  {displayChannels.map((c, idx) => {
                    const isFocused = showDrawer
                      ? focusedPane === 'channels' && focusedChannelIndex === idx
                      : activeChannel === idx;
                    return (
                      <div
                        key={c.id || idx}
                        ref={isFocused ? focusedChannelItemRef : null}
                        onClick={() => {
                          handleSelectChannel(c);
                          setShowDrawer(false);
                          setShowEpg(false);
                        }}
                        onMouseEnter={() => {
                          if (showDrawer) {
                            setFocusedPane('channels');
                            setFocusedChannelIndex(idx);
                          }
                        }}
                        className={`relative flex flex-col justify-between cursor-pointer group transition-all duration-200 p-3 sm:p-4 select-none rounded-2xl border backdrop-blur-xl ${
                          isFocused
                            ? 'bg-neutral-900/85 border-cyan-400 ring-2 ring-cyan-400/80 shadow-[0_0_35px_rgba(0,242,254,0.4)] scale-[1.04] z-10'
                            : 'bg-black/50 hover:bg-neutral-900/70 border-white/10 hover:border-cyan-400/40 hover:scale-[1.02]'
                        }`}
                      >
                        {/* Card Top Row: Channel Number + Live Status Badge */}
                        <div className="flex items-center justify-between gap-1.5 w-full mb-2">
                          <span
                            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full transition-all ${
                              isFocused
                                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-black font-extrabold shadow-sm'
                                : 'bg-white/10 text-cyan-300 border border-white/10'
                            }`}
                          >
                            #{c.id}
                          </span>

                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE</span>
                          </div>
                        </div>

                        {/* Card Center: Channel Logo / Visual Preview */}
                        <div className="w-full h-20 sm:h-24 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5 my-1 overflow-hidden">
                          {c.logo ? (
                            <img
                              src={c.logo}
                              alt={c.name}
                              className={`w-full h-full object-contain filter transition-all duration-200 ${
                                isFocused ? 'scale-105 drop-shadow-[0_0_16px_rgba(0,242,254,0.7)]' : 'group-hover:scale-105'
                              }`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center text-cyan-400 font-bold text-sm">
                              <Tv className="w-8 h-8 opacity-60" />
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Row: Channel Name + Category / Quality Tag */}
                        <div className="mt-2 w-full">
                          <div
                            className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                              isFocused ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                            }`}
                            title={c.name}
                          >
                            {c.name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5 font-medium">
                            <span className="truncate">{c.group || 'General'}</span>
                            <span className="text-cyan-400/90 font-mono font-bold flex-shrink-0 ml-1">HD</span>
                          </div>
                        </div>

                        {/* Focus Indicator Glow Bar on Bottom of Card */}
                        {isFocused && (
                          <div className="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_12px_rgba(0,242,254,0.9)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Synchronized EPG Grid Timeline */
          <div
            className="absolute inset-x-0 bottom-0 z-30 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <EpgGrid
              channels={displayChannels}
              epgData={epgData}
              activeChannel={activeChannel}
              playingChannelId={currentChannelData.id}
              favorites={favorites}
              categoryName={activeCategoryName}
              onToggleFavorite={toggleFavorite}
              onSelectChannel={(idx) => {
                setActiveChannel(idx);
                setPlayingChannelData(displayChannels[idx]);
                setShowEpg(false);
                setShowMiniGuide(true);
              }}
            />
          </div>
        )
      )}

      {/* Layer 6: Bottom Floating DTH Mini-Guide HUD */}
      {showMiniGuide && !showEpg && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 pointer-events-auto">
          <IptvMiniGuide
            channel={focusedChannelData}
            channelIndex={activeChannel}
            isFavorite={favorites.some((f) => f.toString() === focusedChannelData.id.toString())}
            onToggleFavorite={() => toggleFavorite(focusedChannelData.id)}
            onOpenEpg={() => setShowEpg(true)}
            onOpenSearch={() => setShowSearch(true)}
            onOpenSettings={() => setShowSettings(true)}
            onToggleFullscreen={toggleFullscreen}
            isPlaying={isPlaying}
            onTogglePlay={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play().catch(() => {});
                  setIsPlaying(true);
                } else {
                  videoRef.current.pause();
                  setIsPlaying(false);
                }
              }
            }}
            currentProgramTitle={
              (focusedChannelData.tvgId && epgData[focusedChannelData.tvgId]?.[0]?.title) ||
              `${focusedChannelData.name.replace(/\s*[\(\[]?(1080p|720p|576p|480p|4k|2160p|FHD|HD|SD|UHD)[\)\]]?/i, '')} Live Broadcast`
            }
            currentProgramDesc={
              (focusedChannelData.tvgId && epgData[focusedChannelData.tvgId]?.[0]?.desc) ||
              'Broadcasting live streaming video via Video Player by ARRJS.'
            }
            progressPercent={45}
          />
        </div>
      )}

      {/* Layer 7: Category Drawer Modal (Inside Fullscreen Shell) */}
      <IptvCategoryDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(idx) => {
          setActiveCategory(idx);
          setActiveChannel(0);
          setFocusedPane('channels');
          setFocusedChannelIndex(0);
        }}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSearch={() => setShowSearch(true)}
        channelCounts={categoryCounts}
        isDrawerFocused={focusedPane === 'drawer'}
        onFocusDrawer={() => setFocusedPane('drawer')}
        onRequestChannelFocus={() => {
          setFocusedPane('channels');
          setFocusedChannelIndex(0);
        }}
      />

      {/* Layer 8: Quick Search Overlay Modal (Inside Fullscreen Shell) */}
      <IptvSearchOverlay
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        channels={channels.length > 0 ? channels : DEFAULT_MOCK_CHANNELS}
        onSelectChannel={(c) => {
          handleSelectChannel(c);
          setShowSearch(false);
        }}
      />

      {/* Layer 9: Player Quality, Audio & Aspect Ratio Settings (Inside Fullscreen Shell) */}
      <IptvPlayerSettingsOverlay
        isOpen={showPlayerSettings}
        onClose={() => setShowPlayerSettings(false)}
        videoLevels={videoLevels}
        currentVideoLevel={currentVideoLevel}
        onSelectVideoLevel={handleSetQuality}
        audioTracks={audioTracks}
        currentAudioTrack={currentAudioTrack}
        onSelectAudioTrack={handleSetAudio}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
      />

      {/* Layer 10: Playlist & IPTV Settings Modal (Inside Fullscreen Shell) */}
      <IptvSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        playlistUrl={playlistUrl}
        onSavePlaylistUrl={handleSavePlaylistUrl}
        epgUrl={epgUrl}
        onSaveEpgUrl={(url) => {
          setEpgUrl(url);
          localStorage.setItem('iptv_epg_url', url);
          fetchEpgData(url);
        }}
        onLoadLocalFile={handleLoadLocalFile}
        onClearPlaylist={handleClearPlaylist}
        channelCount={channels.length}
        loading={loading}
        sourceName={sourceName}
        sourceType={sourceType}
        sampleStreams={SAMPLE_IPTV_STREAMS}
        onSelectSampleStream={handleSelectSampleStream}
        onPlayDirectUrl={handlePlayDirectUrl}
        xtreamCredentials={xtreamCredentials}
        onLoginXtream={handleLoginXtream}
        stalkerCredentials={stalkerCredentials}
        onLoginStalker={handleLoginStalker}
      />

      {/* Smart TV Back-Press Accidental Exit Protection Toast */}
      {showExitConfirmToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-black/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.5)] text-white backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5 text-sm font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Press Back again to exit player</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExitConfirmToast(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-200 transition-colors"
            >
              Stay Watching
            </button>
            <button
              type="button"
              onClick={() => {
                setShowExitConfirmToast(false);
                if (onExitToHome) onExitToHome();
                else window.location.href = '/';
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-xs font-semibold text-white transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerTool;
