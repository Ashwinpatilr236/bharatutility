import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAdminStore } from "../../hooks/useAdminStore";
import { CATEGORIES } from "../../data/categories";
import { ThemeAccentPicker } from "./ThemeAccentPicker";
import { FavoritesHistoryModal } from "./FavoritesHistoryModal";
import { DynamicIcon } from "./DynamicIcon";
import { Link } from "./Link";
import { LiveCivicTicker } from "../home/LiveCivicTicker";
import {
  Search,
  Star,
  Layers,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Megaphone,
  BookOpen,
  Shield,
  Download,
} from "lucide-react";

export const Header: React.FC = () => {
  const adminStore = useAdminStore();
  const announcements = adminStore.getAnnouncements().filter((a) => a.enabled);
  const { setCommandPaletteOpen, favorites, view } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isFavModalOpen, setIsFavModalOpen] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("bu_announcement_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const activeAnnouncement = announcements[0];
  const formattedAnnouncement = (() => {
    if (!activeAnnouncement) return null;
    const title = (activeAnnouncement.title || "").trim();
    const msg = (activeAnnouncement.message || "").trim();
    const cta = (activeAnnouncement.ctaText || "").trim();

    const isDuplicate = 
      !msg || 
      title.toLowerCase() === msg.toLowerCase() ||
      (title.toLowerCase().includes("parksignal") && msg.toLowerCase().includes("parksignal"));

    let displayText = "";
    if (isDuplicate) {
      displayText = title.toLowerCase().includes("parksignal")
        ? "🚨 ParkSignal — Smart Vehicle Privacy QR Stickers is now live!"
        : title;
    } else {
      displayText = `${title}: ${msg}`;
    }

    let displayCta = cta;
    if (isDuplicate || cta.toLowerCase() === title.toLowerCase()) {
      displayCta = "Explore ParkSignal";
    }

    return {
      displayText,
      displayCta,
      ctaUrl: activeAnnouncement.ctaUrl || "/parksignal"
    };
  })();

  return (
    <>
      {/* ── Top Announcement Banner (if any active & not dismissed) ── */}
      {formattedAnnouncement && !isAnnouncementDismissed && (
        <div className="relative bg-gradient-to-r from-accent via-indigo-600 to-purple-600 text-white text-[11px] py-1.5 px-8 text-center font-medium shadow-2xs flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>{formattedAnnouncement.displayText}</span>
          {formattedAnnouncement.displayCta && formattedAnnouncement.ctaUrl && (
            <a
              href={formattedAnnouncement.ctaUrl}
              className="underline font-bold hover:text-amber-200 ml-1 inline-flex items-center gap-0.5"
            >
              {formattedAnnouncement.displayCta} →
            </a>
          )}
          <button
            onClick={() => {
              setIsAnnouncementDismissed(true);
              try {
                sessionStorage.setItem("bu_announcement_dismissed", "true");
              } catch {}
            }}
            className="absolute right-3 p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss announcement"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Sleek Glassmorphic Main Navbar (10/10 Premium) ── */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/70 dark:border-white/10 bg-white/85 dark:bg-black/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-3">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link
              id="brand-logo-btn"
              to="/"
              className="flex items-center gap-2 group text-left focus:outline-none shrink-0 select-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-indigo-500 dark:to-indigo-800 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform shrink-0 border border-white/20">
                <span className="font-black text-xs sm:text-sm tracking-tighter">
                  ₹U
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-black text-base sm:text-lg font-display tracking-tight text-neutral-900 dark:text-white leading-none">
                  Bharat<span className="text-accent">Utility</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 leading-none">
                  TECH
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 shrink-0 whitespace-nowrap">
              {/* 1. All Tools */}
              <Link
                to="/tools"
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  view.type === "all-tools"
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70"
                }`}
              >
                All Tools
              </Link>

              {/* 2. Categories Mega-Dropdown */}
              <div className="relative group shrink-0">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-accent transition-colors" />
                  <span>Categories</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform duration-200 shrink-0" />
                </button>

                {isCategoriesOpen && (
                  <div
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                    className="absolute top-full left-0 mt-1 w-[520px] max-h-[75vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {/* Column 1: Core & Everyday Utilities */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                          <span>Core Utilities</span>
                          <span className="text-[9px] text-accent font-semibold">
                            7 Suites
                          </span>
                        </div>
                        {CATEGORIES.filter((c) =>
                          [
                            "money",
                            "daily-life",
                            "construction",
                            "education",
                            "business",
                            "technology",
                            "datetime",
                          ].includes(c.id),
                        ).map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="w-full flex items-center justify-between p-1.5 rounded-lg text-left hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded bg-accent-subtle text-accent shrink-0">
                                <DynamicIcon name={cat.icon} className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-accent">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1 py-0.2 rounded shrink-0">
                              {cat.toolCount}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Column 2: Civic & Specialty Hubs */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 border-b border-neutral-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                          <span>Civic & Transit</span>
                          <span className="text-[9px] text-emerald-500 font-semibold">
                            6 Suites
                          </span>
                        </div>
                        {CATEGORIES.filter((c) =>
                          [
                            "india-services",
                            "document-tools",
                            "documents",
                            "vehicle-utility",
                            "travel-utility",
                            "travel",
                          ].includes(c.id),
                        ).map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="w-full flex items-center justify-between p-1.5 rounded-lg text-left hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <DynamicIcon name={cat.icon} className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-emerald-500">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1 py-0.2 rounded shrink-0">
                              {cat.toolCount}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Sanatan Next Initiative promo */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🕉️</span>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            Sanatan Next
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                            Jyotirlingas, Shakti Peeths & Live Panchang
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/sanatan-next"
                        onClick={() => setIsCategoriesOpen(false)}
                        className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-[10px] font-bold shrink-0 transition-colors"
                      >
                        Explore ↗
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. ParkSignal (Featured High-Tech Pill) */}
              <Link
                to="/parksignal"
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  view.type === "parksignal"
                    ? "bg-cyan-500 text-slate-950 shadow-xs"
                    : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
                <span>ParkSignal</span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-black uppercase tracking-wider">
                  NEW
                </span>
              </Link>

              {/* 4. Guides */}
              <Link
                to="/guides"
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  view.type === "guides" || view.type === "blog" || view.type === "article"
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Guides</span>
              </Link>
            </nav>
          </div>

          {/* Quick Search Spotlight Button, Favorites & Theme Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Linear-Style Spotlight Search Button */}
            <button
              id="global-search-trigger"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 bg-neutral-100/80 dark:bg-neutral-900/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg border border-neutral-200/80 dark:border-white/10 shadow-2xs transition-all text-xs font-medium cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="hidden sm:inline text-xs">Search 233+ tools...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-bold text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                {typeof window !== "undefined" &&
                navigator.platform?.toUpperCase().indexOf("MAC") >= 0
                  ? "⌘K"
                  : "Ctrl+K"}
              </kbd>
            </button>

            {/* Saved Tools Star Modal Trigger */}
            <button
              id="favorites-history-button"
              onClick={() => setIsFavModalOpen(true)}
              title="Saved tools and recent calculations"
              className="relative p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Star
                className={`w-4 h-4 ${
                  favorites.length > 0
                    ? "text-amber-500 fill-current"
                    : "text-neutral-400"
                }`}
              />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-0.5 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Theme & Accent Switcher */}
            <ThemeAccentPicker />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Seamless Integrated Live Bharat Ticker ── */}
        <LiveCivicTicker />

        {/* ── Mobile Drawer Menu ── */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl px-4 py-3.5 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-4 gap-2">
              <Link
                to="/tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>All Tools</span>
              </Link>
              <Link
                to="/guides"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <BookOpen className="w-4 h-4 text-accent" />
                <span>Guides</span>
              </Link>
              <button
                onClick={() => {
                  setIsFavModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>Saved ({favorites.length})</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const banner = document.getElementById("pwa-install-btn");
                  if (banner) banner.click();
                  else {
                    window.dispatchEvent(new CustomEvent("bu:prompt-install"));
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-accent-subtle text-accent text-[11px] font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Install</span>
              </button>
            </div>

            {/* ParkSignal Mobile Card */}
            <Link
              to="/parksignal"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-cyan-500/30 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>ParkSignal</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-black">
                      NEW
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300">
                    Vehicle Privacy QR Stickers (100% Free)
                  </span>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-bold">Open →</span>
            </Link>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Popular Categories
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <DynamicIcon name={cat.icon} className="w-3 h-3 text-accent" />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Favorites & History Modal */}
      <FavoritesHistoryModal
        isOpen={isFavModalOpen}
        onClose={() => setIsFavModalOpen(false)}
      />
    </>
  );
};
