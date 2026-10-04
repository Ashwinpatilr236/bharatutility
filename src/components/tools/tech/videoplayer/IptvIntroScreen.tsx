import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  ShieldCheck,
  Upload,
  Globe,
  HelpCircle,
  Mail,
  ChevronRight,
  Maximize,
  Tv,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Bookmark,
  Layers,
  Cpu,
  KeyRound,
  Copy,
  Check,
  ArrowDown,
  ArrowUp,
  Info,
  Server,
  HardDrive,
  RefreshCw,
  Eye,
  EyeOff,
  Dice5,
  Settings,
  AlertCircle
} from 'lucide-react';
import { ArrjsTvLogo } from './ArrjsTvLogo';
import { getXtreamM3uUrl } from './xtreamClient';
import { formatMacAddress, isValidMacAddress, generateRandomMagMac } from './stalkerClient';
import { useSpatialNavigation } from './useSpatialNavigation';

interface IptvIntroScreenProps {
  onComplete: () => void;
  onRequestFullscreen?: () => void;
  onRequestOpenSettings?: () => void;
  onSavePlaylistUrl?: (url: string) => Promise<void>;
  onLoginXtream?: (server: string, user: string, pass: string) => Promise<void>;
  onLoginStalker?: (portalUrl: string, macAddress: string) => Promise<void>;
}

export const IptvIntroScreen: React.FC<IptvIntroScreenProps> = ({
  onComplete,
  onRequestFullscreen,
  onRequestOpenSettings,
  onSavePlaylistUrl,
  onLoginXtream,
  onLoginStalker,
}) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showBookmarkToast, setShowBookmarkToast] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'m3u' | 'xtream' | 'stalker'>('m3u');

  // Direct configuration state right on the landing page
  const [introM3uUrl, setIntroM3uUrl] = useState<string>('');
  const [introXtreamServer, setIntroXtreamServer] = useState<string>('');
  const [introXtreamUser, setIntroXtreamUser] = useState<string>('');
  const [introXtreamPass, setIntroXtreamPass] = useState<string>('');
  const [showXtreamPass, setShowXtreamPass] = useState<boolean>(false);
  const [introStalkerUrl, setIntroStalkerUrl] = useState<string>('');
  const [introStalkerMac, setIntroStalkerMac] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const guideSectionRef = useRef<HTMLDivElement>(null);

  // Keyboard & TV Remote D-Pad Navigation is wired below via useSpatialNavigation
  // (Up/Down/Left/Right move focus, OK/Enter activates, Back skips the intro).

  const handleFinish = (withFullscreen = false) => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (withFullscreen && onRequestFullscreen) {
        onRequestFullscreen();
      }
      onComplete();
    }, 350);
  };

  const handleOpenSettingsFromIntro = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onRequestOpenSettings) {
        onRequestOpenSettings();
      } else {
        onComplete();
      }
    }, 250);
  };

  useSpatialNavigation(containerRef, {
    enabled: !isFadingOut,
    onBack: () => handleFinish(false),
  });

  const handleBookmarkClick = () => {
    try {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        setCopiedUrl(true);
      }
    } catch {
      // ignore
    }
    setShowBookmarkToast(true);
    setTimeout(() => {
      setShowBookmarkToast(false);
      setCopiedUrl(false);
    }, 4500);
  };

  const scrollToGuide = () => {
    guideSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePasteInto = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setter(text.trim());
    } catch {
      // fallback
    }
  };

  // Direct Submission Handlers right on the landing page
  const handleDirectM3uConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introM3uUrl.trim()) return;
    setStatusMessage(null);
    setLoading(true);
    try {
      if (onSavePlaylistUrl) {
        await onSavePlaylistUrl(introM3uUrl.trim());
        handleFinish();
      } else {
        handleOpenSettingsFromIntro();
      }
    } catch (err: unknown) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Could not fetch remote playlist. Check URL or use Local File tab in Settings.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectXtreamConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introXtreamServer.trim() || !introXtreamUser.trim() || !introXtreamPass.trim()) return;
    setStatusMessage(null);
    setLoading(true);
    try {
      if (onLoginXtream) {
        await onLoginXtream(introXtreamServer.trim(), introXtreamUser.trim(), introXtreamPass.trim());
        handleFinish();
      } else {
        handleOpenSettingsFromIntro();
      }
    } catch (err: unknown) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Xtream authentication failed. Check credentials or server URL.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectStalkerConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introStalkerUrl.trim() || !introStalkerMac.trim()) return;
    setStatusMessage(null);
    setLoading(true);
    try {
      if (onLoginStalker) {
        await onLoginStalker(introStalkerUrl.trim(), introStalkerMac.trim());
        handleFinish();
      } else {
        handleOpenSettingsFromIntro();
      }
    } catch (err: unknown) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Stalker portal handshake failed. Check portal URL and registered MAC.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatedIntroXtreamM3u =
    introXtreamServer && introXtreamUser && introXtreamPass
      ? getXtreamM3uUrl(introXtreamServer, introXtreamUser, introXtreamPass)
      : '';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] bg-[#04060b] text-white transition-all duration-300 overflow-y-auto iptv-custom-scrollbar scroll-smooth ${
        isFadingOut ? 'opacity-0 scale-[1.01] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Atmospheric Cinema Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-cyan-500/10 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[550px] h-[350px] bg-violet-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Bookmark Toast Notification Popup */}
      {showBookmarkToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 max-w-sm rounded-2xl bg-neutral-900/95 border border-cyan-400/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
              <Bookmark className="w-4 h-4 fill-cyan-400/40" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5 flex items-center gap-1.5">
                <span>Bookmark ARRJS Video Player</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-cyan-300 font-mono font-bold">Ctrl + D</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-cyan-300 font-mono font-bold">⌘ + D</kbd> on Mac) to bookmark this page for instant access!
              </p>
              {copiedUrl && (
                <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Player URL copied to clipboard</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inner Scroll Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 min-h-screen flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          {/* Official ARRJS Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ArrjsTvLogo size="md" showText={true} />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-cyan-400/20 to-sky-400/20 border border-cyan-400/40 text-cyan-300 font-mono tracking-wider">
              Smart Video Player
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Settings Modal Button */}
            <button
              type="button"
              onClick={handleOpenSettingsFromIntro}
              className="px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Open Settings & Stream Sources"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">Settings</span>
            </button>

            {/* Add to Bookmark Button */}
            <button
              type="button"
              onClick={handleBookmarkClick}
              className="px-3 sm:px-3.5 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Bookmark ARRJS Video Player in your browser"
            >
              <Bookmark className="w-3.5 h-3.5 fill-cyan-400/30" />
              <span className="hidden xs:inline">Bookmark</span>
            </button>

            {/* Launch / Skip Button */}
            <button
              type="button"
              onClick={() => handleFinish(false)}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-black text-xs font-black transition-all shadow-md active:scale-95"
            >
              Launch &rarr;
            </button>
          </div>
        </div>

        {/* Center Hero Section */}
        <div className="my-auto py-8 sm:py-12 flex flex-col items-center text-center space-y-6 sm:space-y-8">
          {/* Main Title & Subtitle */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ARRJS Smart Video Player Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 drop-shadow-[0_2px_12px_rgba(0,242,254,0.35)]">
                ARRJS Video Player
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl mx-auto">
              Your high-performance, client-side Smart Video Player for streaming online media, M3U playlists, Xtream Codes API, and MAG Stalker portals.
            </p>
          </div>

          {/* 3 Prominent Information & Compliance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full text-left">
            {/* Card 1: Add Your Own M3U, Xtream & MAC Portal */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-400 transition-all flex flex-col justify-between group shadow-lg shadow-cyan-950/20">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span>Add M3U, Xtream & MAC</span>
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Connect your personal subscriptions via remote M3U / M3U8 links, Xtream Codes API (User & Pass), or Stalker MAG Portal MAC address.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenSettingsFromIntro}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Configure Playlists & Logins</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: We Do Not Host Any IPTV */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span>We Do Not Host Any IPTV</span>
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  ARRJS provides purely client-side player technology. We do not host, broadcast, archive, or transmit any video streams, television channels, or media servers.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% In-Browser Playback</span>
              </div>
            </div>

            {/* Card 3: Open Streams & Inquiries */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <span>Open Streams & Inquiries</span>
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We use demonstration test streams which are widely and openly available on the public web. If you have any questions or feedback, feel free to reach out to us.
                </p>
              </div>

              <a
                href="mailto:support@arrjs.in?subject=ARRJS%20Video%20Player%20Inquiry"
                className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Feel Free to Reach Out</span>
              </a>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg pt-2">
            <button
              type="button"
              data-autofocus
              onClick={() => handleFinish(true)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-98 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-400/25 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Enter Video Player Experience</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleOpenSettingsFromIntro}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/15"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Configure Streams</span>
            </button>

            <button
              type="button"
              onClick={handleBookmarkClick}
              className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-cyan-400/30"
              title="Add to Bookmark"
            >
              <Bookmark className="w-4 h-4 fill-cyan-400/20" />
              <span>Bookmark</span>
            </button>
          </div>

          {/* Scroll Down Cue Button */}
          <button
            type="button"
            onClick={scrollToGuide}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-xs font-bold text-cyan-300 hover:text-white transition-all pt-2 group shadow-md"
          >
            <span>Scroll down for Stream Settings & Setup Guide</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce group-hover:text-cyan-400" />
          </button>
        </div>

        {/* SECTION 2: STREAM SETTINGS & STEP-BY-STEP SETUP GUIDE */}
        <div ref={guideSectionRef} className="pt-12 sm:pt-16 pb-8 border-t border-white/10 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connect Streams & Setup Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Connect M3U, Xtream Codes & MAC Portal
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
              Enter your stream details directly below. On TV, use the remote arrows to move and OK to select.
            </p>
          </div>

          {/* Status / Error Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 max-w-lg mx-auto ${
                statusMessage.isError
                  ? 'bg-red-500/20 border border-red-500/40 text-red-200'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Guide Selector Tabs (Supports Left/Right Arrow switching) */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/15 max-w-md mx-auto shadow-xl">
            <button
              type="button"
              onClick={() => setActiveGuideTab('m3u')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeGuideTab === 'm3u'
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>M3U Playlist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGuideTab('xtream')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeGuideTab === 'xtream'
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Xtream Codes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGuideTab('stalker')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeGuideTab === 'stalker'
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>MAC Portal</span>
            </button>
          </div>

          {/* TAB 1: M3U PLAYLIST CONFIGURATION & GUIDE */}
          {activeGuideTab === 'm3u' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl bg-neutral-900/60 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl animate-in fade-in duration-200 shadow-2xl">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Option 1: M3U / M3U8 Subscription Link</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Add Remote M3U URL or Local File
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Connect your live TV subscription using standard M3U playlists with full category and EPG TV guide support.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Paste Remote M3U URL</div>
                      <div className="text-[11px] text-neutral-400">Enter your provider link below or into the Settings Modal.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Bypass Browser CORS with Local File</div>
                      <div className="text-[11px] text-neutral-400">
                        If your remote IPTV host blocks browser requests, download the <code className="text-cyan-300">.m3u</code> file and drop it into <strong>Local M3U File</strong> tab!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSettingsFromIntro}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Modal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    className="py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Launch Player</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Direct Working Form on the Landing Page */}
              <form
                onSubmit={handleDirectM3uConnect}
                className="lg:col-span-6 p-5 rounded-2xl bg-black/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md space-y-3.5 text-left"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Direct M3U Connect</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Instant Load</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                    Enter Playlist URL (.m3u / .m3u8)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={introM3uUrl}
                      onChange={(e) => setIntroM3uUrl(e.target.value)}
                      placeholder="https://provider.com/get.php?username=...&type=m3u_plus"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-3 pr-20 py-2.5 text-xs text-white outline-none font-mono placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasteInto(setIntroM3uUrl)}
                      className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Paste</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-neutral-300 leading-relaxed">
                  💡 Tip: You can also drag & drop any <code className="text-cyan-300">.m3u</code> file directly from your computer inside Settings for 100% private, CORS-free playback.
                </div>

                <button
                  type="submit"
                  disabled={loading || !introM3uUrl.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading Channels...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connect M3U & Launch Player</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: XTREAM CODES API CONFIGURATION & GUIDE */}
          {activeGuideTab === 'xtream' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl bg-neutral-900/60 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl animate-in fade-in duration-200 shadow-2xl">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Option 2: Xtream Codes API Login</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Server URL, Username & Password
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Log in directly with your Xtream account credentials. The player will automatically query the server and generate your live streams.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Enter Server Host & Port</div>
                      <div className="text-[11px] text-neutral-400">Example: <code className="text-cyan-300">http://line.provider.com:8080</code></div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Enter Username & Password</div>
                      <div className="text-[11px] text-neutral-400">Your IPTV line credentials with show/hide password toggle.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSettingsFromIntro}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Modal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    className="py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Launch Player</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Direct Working Form on the Landing Page */}
              <form
                onSubmit={handleDirectXtreamConnect}
                className="lg:col-span-6 p-5 rounded-2xl bg-black/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md space-y-3 text-left"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Xtream API Direct Login</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">REST API</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Server Host / URL</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={introXtreamServer}
                      onChange={(e) => setIntroXtreamServer(e.target.value)}
                      placeholder="http://iptv-server.com:8080"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-3 pr-16 py-2 text-xs text-white font-mono placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasteInto(setIntroXtreamServer)}
                      className="absolute right-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 text-[10px] font-semibold"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Username</label>
                    <input
                      type="text"
                      value={introXtreamUser}
                      onChange={(e) => setIntroXtreamUser(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showXtreamPass ? 'text' : 'password'}
                        value={introXtreamPass}
                        onChange={(e) => setIntroXtreamPass(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-3 pr-8 py-2 text-xs text-white font-mono placeholder:text-neutral-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowXtreamPass(!showXtreamPass)}
                        className="absolute right-2 text-neutral-400 hover:text-white"
                      >
                        {showXtreamPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {generatedIntroXtreamM3u ? (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 font-mono truncate">
                    Direct M3U: {generatedIntroXtreamM3u}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !introXtreamServer.trim() || !introXtreamUser.trim() || !introXtreamPass.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating Xtream...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Login Xtream & Launch Player</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: STALKER MAC PORTAL CONFIGURATION & GUIDE */}
          {activeGuideTab === 'stalker' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl bg-neutral-900/60 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl animate-in fade-in duration-200 shadow-2xl">
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  <span>Option 3: Stalker MAC Portal (MAG STB)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Connect via MAG Device MAC Address
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Emulate a hardware MAG Set-Top Box to connect to Stalker Middleware portals using MAC address authentication.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Enter Portal Address</div>
                      <div className="text-[11px] text-neutral-400">Usually ends with <code className="text-cyan-300">/c/</code> or <code className="text-cyan-300">/stalker_portal/c/</code>.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Enter or Generate MAG MAC Address</div>
                      <div className="text-[11px] text-neutral-400">
                        Use the "Generate MAC" button for instant standard <code className="text-cyan-300">00:1A:79</code> Infomir vendor prefix.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSettingsFromIntro}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Modal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    className="py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Launch Player</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Direct Working Form on the Landing Page */}
              <form
                onSubmit={handleDirectStalkerConnect}
                className="lg:col-span-6 p-5 rounded-2xl bg-black/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md space-y-3 text-left"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Stalker Portal Direct Login</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">MAG STB</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Portal Address URL</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={introStalkerUrl}
                      onChange={(e) => setIntroStalkerUrl(e.target.value)}
                      placeholder="http://portal.geniptv.com:8080/c/"
                      className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-3 pr-16 py-2 text-xs text-white font-mono placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasteInto(setIntroStalkerUrl)}
                      className="absolute right-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 text-[10px] font-semibold"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Device MAC Address</label>
                    <button
                      type="button"
                      onClick={() => setIntroStalkerMac(generateRandomMagMac())}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <Dice5 className="w-3 h-3" />
                      <span>Generate MAC</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={introStalkerMac}
                      onChange={(e) => setIntroStalkerMac(formatMacAddress(e.target.value))}
                      placeholder="00:1A:79:XX:XX:XX"
                      maxLength={17}
                      className="w-full bg-neutral-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-3 pr-16 py-2 text-xs text-cyan-300 font-mono font-bold tracking-wider placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasteInto((v) => setIntroStalkerMac(formatMacAddress(v)))}
                      className="absolute right-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 text-[10px] font-semibold"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                  Negotiates token handshake directly with Stalker server/load.php.
                </div>

                <button
                  type="submit"
                  disabled={loading || !introStalkerUrl.trim() || !introStalkerMac.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting to Stalker...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Connect Stalker & Launch Player</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Legal Transparency & Compliance Notice */}
        <div className="w-full pt-6 pb-2 border-t border-white/10 text-center flex-shrink-0">
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-3xl mx-auto">
            <strong className="text-white">Legal Notice:</strong> ARRJS Technologies does not provide, host, sell, or broadcast any IPTV subscriptions, video channels, or copyright media. ARRJS Video Player is purely client-side software designed for user-provided stream sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IptvIntroScreen;
