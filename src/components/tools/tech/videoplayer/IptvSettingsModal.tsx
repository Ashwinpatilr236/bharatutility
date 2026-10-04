import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Globe,
  Tv,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Film,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Copy,
  Sparkles,
  ArrowRight,
  HardDrive,
  Radio,
  ExternalLink,
  KeyRound,
  Cpu,
  Eye,
  EyeOff,
  Download,
  Dice5,
  Layers,
  Server
} from 'lucide-react';
import { SampleStream, XtreamCredentials, StalkerCredentials, IptvSourceType } from './types';
import { ArrjsTvLogo } from './ArrjsTvLogo';
import { getXtreamM3uUrl } from './xtreamClient';
import { formatMacAddress, isValidMacAddress, generateRandomMagMac } from './stalkerClient';
import { useSpatialNavigation } from './useSpatialNavigation';
import { IptvConstructionNotice } from './IptvConstructionNotice';

interface IptvSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistUrl: string;
  onSavePlaylistUrl: (url: string) => Promise<void>;
  epgUrl: string;
  onSaveEpgUrl: (url: string) => void;
  onLoadLocalFile: (content: string, fileName: string) => void;
  onClearPlaylist: () => void;
  channelCount: number;
  loading: boolean;
  sourceName?: string;
  sourceType?: IptvSourceType;
  sampleStreams: SampleStream[];
  onSelectSampleStream: (sample: SampleStream) => void;
  onPlayDirectUrl: (url: string, name: string) => void;
  // Xtream Codes API
  xtreamCredentials?: XtreamCredentials | null;
  onLoginXtream?: (server: string, user: string, pass: string) => Promise<void>;
  // MAC Portal (Stalker)
  stalkerCredentials?: StalkerCredentials | null;
  onLoginStalker?: (portalUrl: string, macAddress: string) => Promise<void>;
}

type SettingsTab = 'remote' | 'xtream' | 'stalker' | 'local' | 'epg' | 'test-streams' | 'direct';

export const IptvSettingsModal: React.FC<IptvSettingsModalProps> = ({
  isOpen,
  onClose,
  playlistUrl,
  onSavePlaylistUrl,
  epgUrl,
  onSaveEpgUrl,
  onLoadLocalFile,
  onClearPlaylist,
  channelCount,
  loading,
  sourceName,
  sourceType,
  sampleStreams,
  onSelectSampleStream,
  onPlayDirectUrl,
  xtreamCredentials,
  onLoginXtream,
  stalkerCredentials,
  onLoginStalker,
}) => {
  // Active source detection helpers
  const activePlaylistUrl = playlistUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_playlist_url') || '' : '');
  const activeEpgUrl = epgUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_epg_url') || '' : '');
  const activeSourceName = sourceName || (typeof window !== 'undefined' ? localStorage.getItem('iptv_source_name') || '' : '');
  const activeSourceType = sourceType || (activePlaylistUrl ? 'remote' : activeSourceName ? 'local' : channelCount > 10 ? 'local' : 'mock');

  const [activeTab, setActiveTab] = useState<SettingsTab>('remote');
  const [urlInput, setUrlInput] = useState<string>(activePlaylistUrl);
  const [epgInput, setEpgInput] = useState<string>(activeEpgUrl);
  const [directUrl, setDirectUrl] = useState<string>('');
  const [directName, setDirectName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedEpg, setCopiedEpg] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xtream Codes state
  const [xtreamServer, setXtreamServer] = useState<string>(() => {
    return xtreamCredentials?.serverUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_server') || '' : '');
  });
  const [xtreamUser, setXtreamUser] = useState<string>(() => {
    return xtreamCredentials?.username || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_user') || '' : '');
  });
  const [xtreamPass, setXtreamPass] = useState<string>(() => {
    return xtreamCredentials?.password || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_pass') || '' : '');
  });
  const [showXtreamPass, setShowXtreamPass] = useState<boolean>(false);
  const [copiedXtreamM3u, setCopiedXtreamM3u] = useState<boolean>(false);

  // Stalker MAC Portal state
  const [stalkerUrl, setStalkerUrl] = useState<string>(() => {
    return stalkerCredentials?.portalUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_stalker_url') || '' : '');
  });
  const [stalkerMac, setStalkerMac] = useState<string>(() => {
    return stalkerCredentials?.macAddress || (typeof window !== 'undefined' ? localStorage.getItem('iptv_stalker_mac') || '' : '');
  });

  // Sync inputs whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const pUrl = playlistUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_playlist_url') || '' : '');
      const eUrl = epgUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_epg_url') || '' : '');
      const xServer = xtreamCredentials?.serverUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_server') || '' : '');
      const xUser = xtreamCredentials?.username || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_user') || '' : '');
      const xPass = xtreamCredentials?.password || (typeof window !== 'undefined' ? localStorage.getItem('iptv_xtream_pass') || '' : '');
      const sUrl = stalkerCredentials?.portalUrl || (typeof window !== 'undefined' ? localStorage.getItem('iptv_stalker_url') || '' : '');
      const sMac = stalkerCredentials?.macAddress || (typeof window !== 'undefined' ? localStorage.getItem('iptv_stalker_mac') || '' : '');

      setUrlInput(pUrl);
      setEpgInput(eUrl);
      setXtreamServer(xServer);
      setXtreamUser(xUser);
      setXtreamPass(xPass);
      setStalkerUrl(sUrl);
      setStalkerMac(sMac);
      setErrorMessage('');

      // Auto-focus the tab that corresponds to the active source
      if (activeSourceType === 'xtream' || (xServer && xUser && channelCount > 0)) {
        setActiveTab('xtream');
      } else if (activeSourceType === 'stalker' || (sUrl && sMac && channelCount > 0)) {
        setActiveTab('stalker');
      } else if (!pUrl && (activeSourceType === 'local' || (channelCount > 10 && !pUrl))) {
        setActiveTab('local');
      } else {
        setActiveTab('remote');
      }
    }
  }, [isOpen, playlistUrl, epgUrl, activeSourceType, channelCount, xtreamCredentials, stalkerCredentials]);

  // TV Remote & Keyboard D-Pad Navigation inside Settings Modal
  // (must stay above the early return to respect React hook order)
  const modalPanelRef = useRef<HTMLDivElement>(null);
  useSpatialNavigation(modalPanelRef, {
    enabled: isOpen,
    onBack: onClose,
    autoFocus: true,
  });

  if (!isOpen) return null;

  const handleUrlSubmit = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const targetUrl = (overrideUrl || urlInput).trim();
    if (!targetUrl) {
      setErrorMessage('Please enter an M3U playlist URL.');
      return;
    }
    try {
      await onSavePlaylistUrl(targetUrl);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not fetch remote playlist. Most IPTV servers do not send browser CORS headers. Download the .m3u file and use the "Local M3U File" tab for 100% reliable local parsing.'
      );
    }
  };

  const handleXtreamSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!xtreamServer.trim()) {
      setErrorMessage('Please enter the Xtream server URL (e.g. http://domain.com:8080).');
      return;
    }
    if (!xtreamUser.trim()) {
      setErrorMessage('Please enter your Xtream username.');
      return;
    }
    if (!xtreamPass.trim()) {
      setErrorMessage('Please enter your Xtream password.');
      return;
    }

    if (onLoginXtream) {
      try {
        await onLoginXtream(xtreamServer.trim(), xtreamUser.trim(), xtreamPass.trim());
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Xtream authentication failed. Check server URL, credentials or CORS restrictions.'
        );
      }
    }
  };

  const handleStalkerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!stalkerUrl.trim()) {
      setErrorMessage('Please enter the Stalker Portal URL (e.g. http://portal.domain.com:8080/c/).');
      return;
    }
    if (!stalkerMac.trim()) {
      setErrorMessage('Please enter your MAG device MAC address.');
      return;
    }
    if (!isValidMacAddress(stalkerMac.trim())) {
      setErrorMessage('Invalid MAC address format. Example: 00:1A:79:3B:4C:1F');
      return;
    }

    if (onLoginStalker) {
      try {
        await onLoginStalker(stalkerUrl.trim(), stalkerMac.trim());
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Stalker portal handshake failed. Ensure portal URL is reachable and MAC is active.'
        );
      }
    }
  };

  const handleGenerateMac = () => {
    const newMac = generateRandomMagMac();
    setStalkerMac(newMac);
  };

  /* Legacy D-pad handler replaced by useSpatialNavigation above.
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      // Smart TV Back Keys: 10009 (Tizen), 461 (webOS), 4 (Android)
      const isTvBack =
        e.key === 'Escape' ||
        e.key === 'GoBack' ||
        e.key === 'BrowserBack' ||
        (e as any).keyCode === 10009 ||
        (e as any).keyCode === 461 ||
        (e as any).keyCode === 4;

      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isTvBack || (e.key === 'Backspace' && !isInput)) {
        e.preventDefault();
        onClose();
        return;
      }

      const tabs: SettingsTab[] = ['remote', 'xtream', 'stalker', 'local', 'epg', 'test-streams', 'direct'];
      const currentIndex = tabs.indexOf(activeTab);

      if (!isInput) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = (currentIndex + 1) % tabs.length;
          setActiveTab(tabs[nextIdx]);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = (currentIndex - 1 + tabs.length) % tabs.length;
          setActiveTab(tabs[prevIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, activeTab, onClose]);
  */

  const handleEpgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!epgInput.trim()) return;
    onSaveEpgUrl(epgInput.trim());
    onClose();
  };

  const handleFileProcess = (file: File) => {
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onLoadLocalFile(content, file.name);
        onClose();
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    onPlayDirectUrl(directUrl.trim(), directName.trim() || 'Online Stream');
    onClose();
  };

  const handlePasteClipboard = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setter(text.trim());
    } catch {
      // Fallback
    }
  };

  const isXtreamActive = activeSourceType === 'xtream' || (!!xtreamServer && !!xtreamUser && channelCount > 0 && !activePlaylistUrl.includes('/c/'));
  const isStalkerActive = activeSourceType === 'stalker' || (!!stalkerUrl && !!stalkerMac && channelCount > 0);
  const isRemoteActive = (activeSourceType === 'remote' || !!activePlaylistUrl) && !isXtreamActive && !isStalkerActive;
  const isLocalActive = (activeSourceType === 'local' || (!activePlaylistUrl && channelCount > 10)) && !isXtreamActive && !isStalkerActive;
  const isEpgActive = !!activeEpgUrl;

  // Generated Xtream M3U URL for instant copy or download
  const generatedXtreamM3u = xtreamServer && xtreamUser && xtreamPass ? getXtreamM3uUrl(xtreamServer, xtreamUser, xtreamPass) : '';

  const tabItems: {
    id: SettingsTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string;
    isActiveSource?: boolean;
  }[] = [
    {
      id: 'remote',
      label: 'Remote M3U URL',
      sublabel: 'Subscription Link',
      icon: <Globe className="w-4 h-4" />,
      badge: isRemoteActive ? 'Active' : undefined,
      isActiveSource: isRemoteActive,
    },
    {
      id: 'xtream',
      label: 'Xtream Codes API',
      sublabel: 'User, Pass & Server',
      icon: <Layers className="w-4 h-4" />,
      badge: isXtreamActive ? 'Active' : 'Xtream',
      isActiveSource: isXtreamActive,
    },
    {
      id: 'stalker',
      label: 'MAC Portal (Stalker)',
      sublabel: 'MAG Box MAC Login',
      icon: <Cpu className="w-4 h-4" />,
      badge: isStalkerActive ? 'Active' : 'Stalker',
      isActiveSource: isStalkerActive,
    },
    {
      id: 'local',
      label: 'Local M3U File',
      sublabel: 'Drag & Drop File',
      icon: <Upload className="w-4 h-4" />,
      badge: isLocalActive ? 'Active' : 'CORS-Free',
      isActiveSource: isLocalActive,
    },
    {
      id: 'epg',
      label: 'TV Guide (EPG)',
      sublabel: 'XMLTV Schedules',
      icon: <Calendar className="w-4 h-4" />,
      badge: isEpgActive ? 'Active' : undefined,
      isActiveSource: isEpgActive,
    },
    {
      id: 'test-streams',
      label: 'Test Streams',
      sublabel: 'Verified Demo Channels',
      icon: <Film className="w-4 h-4" />,
      badge: `${sampleStreams.length}`,
    },
    {
      id: 'direct',
      label: 'Direct Video URL',
      sublabel: 'Single Stream Playback',
      icon: <Tv className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalPanelRef}
        className="w-full max-w-4xl bg-neutral-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl text-white flex flex-col overflow-hidden h-full max-h-full sm:h-[640px] sm:max-h-[92%] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <ArrjsTvLogo size="sm" showText={false} animated={true} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                  IPTV Playlist & Stream Sources
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-cyan-400 to-sky-400 text-black font-mono">
                  Smart TV Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Configure your live channels, M3U subscriptions, and EPG TV guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {channelCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{channelCount} Channels Active</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Column Smart TV Settings Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Navigation Rail */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 backdrop-blur-md p-2.5 sm:p-3 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto no-scrollbar flex-shrink-0 gap-1.5">
            <div className="flex md:flex-col gap-1.5 flex-1">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400/80">
                <Sparkles className="w-3 h-3" />
                <span>Source Types</span>
              </div>

              {tabItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 text-left whitespace-nowrap md:whitespace-normal group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/25 via-sky-500/15 to-transparent text-white font-bold border-l-2 border-cyan-400 shadow-md backdrop-blur-sm'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-white'}>
                        {tab.icon}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-neutral-200'}`}>
                          {tab.label}
                        </div>
                        <div className="hidden md:block text-[10px] text-neutral-400 leading-tight mt-0.5 truncate">
                          {tab.sublabel}
                        </div>
                      </div>
                    </div>

                    {tab.badge && (
                      <span
                        className={`hidden md:inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono ml-2 ${
                          tab.isActiveSource
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isActive
                            ? 'bg-cyan-400 text-black'
                            : 'bg-white/10 text-neutral-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions on Left Rail */}
            {channelCount > 0 && (
              <div className="hidden md:block pt-3 border-t border-white/10 mt-auto">
                <button
                  type="button"
                  onClick={onClearPlaylist}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/25 transition-all font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Channels</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Content Panel with Visible Custom Scrollbar */}
          <div className="flex-1 min-h-0 p-4 sm:p-7 overflow-y-auto overscroll-contain iptv-custom-scrollbar flex flex-col justify-between bg-black/20 backdrop-blur-md">
            <div>
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-200 text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: REMOTE M3U */}
              {activeTab === 'remote' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>Remote M3U / M3U8 Subscription</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Enter the direct stream URL provided by your IPTV service provider.
                    </p>
                  </div>

                  {/* ALREADY ADDED / ACTIVE PLAYLIST DISPLAY */}
                  {activePlaylistUrl ? (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            Currently Active Playlist
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          {channelCount > 0 ? `${channelCount} Channels Loaded` : 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase font-bold text-neutral-400 mb-0.5">Stream Subscription URL</div>
                          <div className="text-xs text-white font-mono truncate select-all">
                            {activePlaylistUrl}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activePlaylistUrl);
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUrlSubmit(undefined, activePlaylistUrl)}
                          disabled={loading}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/25 to-sky-500/25 hover:from-cyan-500/35 hover:to-sky-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                          <span>{loading ? 'Re-fetching Channels...' : 'Re-Sync Channels'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={onClearPlaylist}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Remove this playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : channelCount > 10 ? (
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 backdrop-blur-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Channels Active ({channelCount} Channels from {activeSourceName || 'Local File'})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('local')}
                          className="text-xs text-cyan-300 hover:text-white underline font-semibold"
                        >
                          View File Source &rarr;
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Channels are currently streaming from your local playlist file. To switch to a remote cloud IPTV URL, enter it below.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={(e) => handleUrlSubmit(e)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        {activePlaylistUrl ? 'Update or Replace Remote Playlist' : 'Playlist URL'}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://provider-domain.com/live/get.php?username=...&type=m3u_plus"
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 shadow-inner font-mono text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard(setUrlInput)}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Browser CORS Compatibility Note</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        If your remote IPTV server blocks direct in-browser requests via CORS, download the <code className="text-cyan-300 bg-white/10 px-1 rounded">.m3u</code> file to your device and use the <strong>Local M3U File</strong> tab for instant, 100% reliable local playback.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !urlInput.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Parsing Playlist Channels...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{activePlaylistUrl && activePlaylistUrl === urlInput.trim() ? 'Re-Load Active Playlist' : 'Load Playlist'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: XTREAM CODES API */}
              {activeTab === 'xtream' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Xtream Codes API Login</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Authenticate directly using your provider Server URL, Username, and Password.
                    </p>
                  </div>

                  {/* Under Construction Notice */}
                  <IptvConstructionNotice featureName="Xtream Codes API Integration" />

                  {/* ALREADY ACTIVE XTREAM ACCOUNT BANNER */}
                  {isXtreamActive ? (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            Currently Active Xtream Account
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          {channelCount > 0 ? `${channelCount} Channels Connected` : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-black/50 border border-white/10">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">Server Host</div>
                          <div className="text-xs text-white font-mono truncate">{xtreamServer}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">Account Username</div>
                          <div className="text-xs text-cyan-300 font-mono truncate">{xtreamUser}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleXtreamSubmit()}
                          disabled={loading}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/25 to-sky-500/25 hover:from-cyan-500/35 hover:to-sky-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                          <span>{loading ? 'Re-syncing Streams...' : 'Re-Sync Xtream Channels'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={onClearPlaylist}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Disconnect Xtream account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <form onSubmit={handleXtreamSubmit} className="space-y-3.5">
                    {/* Server URL Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Server URL / Host Address</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={xtreamServer}
                          onChange={(e) => setXtreamServer(e.target.value)}
                          placeholder="http://iptv-provider.com:8080"
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard(setXtreamServer)}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    {/* Username & Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Username */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Username</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={xtreamUser}
                            onChange={(e) => setXtreamUser(e.target.value)}
                            placeholder="Enter Xtream username"
                            className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-16 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handlePasteClipboard(setXtreamUser)}
                            className="absolute right-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            Paste
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Password</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showXtreamPass ? 'text' : 'password'}
                            value={xtreamPass}
                            onChange={(e) => setXtreamPass(e.target.value)}
                            placeholder="Enter Xtream password"
                            className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-20 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono"
                          />
                          <div className="absolute right-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setShowXtreamPass(!showXtreamPass)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                              title={showXtreamPass ? 'Hide password' : 'Show password'}
                            >
                              {showXtreamPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Generated M3U Link Box */}
                    {generatedXtreamM3u ? (
                      <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 space-y-2 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Auto-Generated Direct M3U Subscription</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">m3u_plus format</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-200 select-all truncate">
                          {generatedXtreamM3u}
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedXtreamM3u);
                              setCopiedXtreamM3u(true);
                              setTimeout(() => setCopiedXtreamM3u(false), 2000);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedXtreamM3u ? 'M3U Link Copied!' : 'Copy Direct M3U URL'}</span>
                          </button>

                          <a
                            href={generatedXtreamM3u}
                            target="_blank"
                            rel="noopener noreferrer"
                            download="playlist.m3u"
                            className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Download M3U file to bypass CORS"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download .m3u</span>
                          </a>
                        </div>
                      </div>
                    ) : null}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !xtreamServer.trim() || !xtreamUser.trim() || !xtreamPass.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting to Xtream Server...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Login & Sync Live Channels</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: STALKER MAC PORTAL (MAG Box) */}
              {activeTab === 'stalker' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>MAC Portal / Stalker Middleware (MAG STB)</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Connect to IPTV Stalker portals using your MAG Box MAC address authentication.
                    </p>
                  </div>

                  {/* Under Construction Notice */}
                  <IptvConstructionNotice featureName="Stalker Portal (MAG MAC) Emulation" />

                  {/* ALREADY ACTIVE STALKER PORTAL BANNER */}
                  {isStalkerActive ? (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            Currently Active Stalker Portal
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          {channelCount > 0 ? `${channelCount} Channels Connected` : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-black/50 border border-white/10">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">Portal Address</div>
                          <div className="text-xs text-white font-mono truncate">{stalkerUrl}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">MAG MAC Address</div>
                          <div className="text-xs text-cyan-300 font-mono truncate">{stalkerMac}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStalkerSubmit()}
                          disabled={loading}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/25 to-sky-500/25 hover:from-cyan-500/35 hover:to-sky-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                          <span>{loading ? 'Re-syncing Portal...' : 'Re-Sync Stalker Channels'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={onClearPlaylist}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Disconnect Stalker portal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <form onSubmit={handleStalkerSubmit} className="space-y-3.5">
                    {/* Portal URL */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Portal URL (e.g. /c/ or /stalker_portal/c/)</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={stalkerUrl}
                          onChange={(e) => setStalkerUrl(e.target.value)}
                          placeholder="http://portal-server.com:8080/c/"
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard(setStalkerUrl)}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    {/* MAC Address Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Device MAC Address (MAG 00:1A:79)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateMac}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                          title="Generate a valid random MAG 00:1A:79 MAC address"
                        >
                          <Dice5 className="w-3.5 h-3.5" />
                          <span>Generate MAG MAC</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={stalkerMac}
                          onChange={(e) => setStalkerMac(formatMacAddress(e.target.value))}
                          placeholder="00:1A:79:XX:XX:XX"
                          maxLength={17}
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-2.5 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono tracking-wider font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard((v) => setStalkerMac(formatMacAddress(v)))}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    {/* Information Note */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Stalker Middleware & MAC Registration</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Stalker portals authenticate via hardware MAC address. Make sure your MAC address is active on your IPTV provider's panel. Standard MAG devices use the <code className="text-cyan-300 bg-white/10 px-1 rounded">00:1A:79</code> vendor prefix.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !stalkerUrl.trim() || !stalkerMac.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Handshaking Stalker Portal...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          <span>Connect & Load Portal Channels</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: LOCAL M3U FILE (Zero CORS, 100% Client-Side) */}
              {activeTab === 'local' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Local M3U / M3U8 File Upload</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Drag and drop your playlist file. Parsed 100% in browser memory with zero server upload.
                    </p>
                  </div>

                  {/* ALREADY ADDED LOCAL FILE BANNER */}
                  {(activeSourceType === 'local' || (!activePlaylistUrl && channelCount > 10)) && (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            Currently Active File Source
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          {channelCount} Channels Loaded
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <HardDrive className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {activeSourceName || 'Local M3U Playlist File'}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              Loaded directly into browser memory (100% CORS-Bypassed)
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onClearPlaylist}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all text-center backdrop-blur-md ${
                      isDragOver
                        ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
                        : 'border-white/15 hover:border-cyan-400/60 bg-black/40 hover:bg-black/60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      {isLocalActive ? 'Drop a new .M3U or .M3U8 file to replace' : 'Drag & Drop your .M3U or .M3U8 file here'}
                    </div>
                    <div className="text-xs text-neutral-400 mb-4 max-w-sm">
                      Completely bypasses all browser CORS blocks with instant local parsing.
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all">
                      Browse File from Device
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".m3u,.m3u8,text/plain"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileProcess(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-neutral-300 backdrop-blur-md">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Privacy First: All file contents are parsed purely in browser RAM.</span>
                  </div>
                </div>
              )}

              {/* TAB 3: EPG XMLTV */}
              {activeTab === 'epg' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Electronic Program Guide (EPG / XMLTV)</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Synchronize live TV timelines, show names, and broadcast schedules into the TV guide.
                    </p>
                  </div>

                  {/* Under Construction Notice */}
                  <IptvConstructionNotice featureName="Remote XMLTV EPG Sync" />

                  {/* ALREADY ADDED EPG SOURCE */}
                  {activeEpgUrl && (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            Currently Active XMLTV Guide
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          Guide Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase font-bold text-neutral-400 mb-0.5">XMLTV Guide URL</div>
                          <div className="text-xs text-white font-mono truncate select-all">
                            {activeEpgUrl}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeEpgUrl);
                            setCopiedEpg(true);
                            setTimeout(() => setCopiedEpg(false), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedEpg ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSaveEpgUrl(activeEpgUrl);
                            onClose();
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/25 to-sky-500/25 hover:from-cyan-500/35 hover:to-sky-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Re-Sync XMLTV Guide</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSaveEpgUrl('');
                            localStorage.removeItem('iptv_epg_url');
                            setEpgInput('');
                          }}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Remove EPG"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleEpgSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        {activeEpgUrl ? 'Update or Replace XMLTV URL' : 'XMLTV Guide URL'}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          value={epgInput}
                          onChange={(e) => setEpgInput(e.target.value)}
                          placeholder="https://epgshare01.online/epgshare01/epg_ripper_ALL_SOURCES1.xml.gz"
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard(setEpgInput)}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!epgInput.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40"
                    >
                      <Radio className="w-4 h-4" />
                      <span>{activeEpgUrl && activeEpgUrl === epgInput.trim() ? 'Re-Sync Schedule' : 'Sync Program Guide Schedule'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: TEST STREAMS */}
              {activeTab === 'test-streams' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>Public Open-Source Test Streams</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      High-definition broadcast samples for testing adaptive bitrate and audio tracks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleStreams.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onSelectSampleStream(sample);
                          onClose();
                        }}
                        className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all group flex flex-col justify-between backdrop-blur-md"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                              {sample.name}
                            </span>
                            <span className="text-[9px] font-mono font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full flex-shrink-0">
                              {sample.format}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-2">
                            {sample.description}
                          </p>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-cyan-400 font-semibold pt-2 border-t border-white/5">
                          <span>Stream Channel #{idx + 1}</span>
                          <span className="group-hover:translate-x-1 transition-transform">Play &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: DIRECT VIDEO URL */}
              {activeTab === 'direct' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Tv className="w-4 h-4 text-cyan-400" />
                      <span>Play Single Video Stream</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Direct playback for any individual HLS .m3u8, MP4, or WebM online stream URL.
                    </p>
                  </div>

                  <form onSubmit={handleDirectSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        Stream URL (.m3u8, .mp4)
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          value={directUrl}
                          onChange={(e) => setDirectUrl(e.target.value)}
                          placeholder="https://example.com/live/broadcast.m3u8"
                          className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl pl-4 pr-24 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 font-mono text-xs sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard(setDirectUrl)}
                          className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Paste</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        Stream Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={directName}
                        onChange={(e) => setDirectName(e.target.value)}
                        placeholder="Live Broadcast Channel"
                        className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-neutral-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!directUrl.trim()}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40"
                    >
                      Play Stream
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile-only Reset Button */}
            {channelCount > 0 && (
              <div className="md:hidden pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">
                  {channelCount} channels loaded
                </span>
                <button
                  type="button"
                  onClick={onClearPlaylist}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
