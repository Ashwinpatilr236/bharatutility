import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccentColor, CalculationHistoryItem, CategoryId, ThemeMode, ViewMode } from '../types';
import { AdminSection } from '../types/admin';
import { getToolBySlug } from '../data/toolsRegistry';
import { updateSeoMetadata, getPathForView } from '../utils/seo';

interface ToastState {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  navigateToTool: (slug: string, params?: Record<string, any>) => void;
  navigateToCategory: (categoryId: CategoryId) => void;
  navigateToHome: () => void;
  navigateToAllTools: () => void;
  navigateToFavorites: () => void;
  navigateToLegal: (page: 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact') => void;
  navigateToContact: () => void;
  navigateToRequestTool: () => void;
  navigateToAdmin: (section?: AdminSection, subParam?: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  favorites: string[];
  toggleFavorite: (toolSlug: string) => void;
  isFavorite: (toolSlug: string) => boolean;
  clearFavorites: () => void;
  reorderFavorites: (newOrder: string[]) => void;
  recentTools: string[];
  addRecentTool: (toolSlug: string) => void;
  removeRecentTool: (toolSlug: string) => void;
  clearRecentTools: () => void;
  clearAllPreferences: () => void;
  calculationHistory: CalculationHistoryItem[];
  addCalculationHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  currentToolParams: Record<string, any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Parses window.location to determine active ViewMode and handles old hash URL conversion
 */
function parseCurrentLocation(): { view: ViewMode; redirectPath?: string } {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  // 1. Check for old hash navigation for backward compatibility
  if (hash.startsWith('#/tool/')) {
    const slug = hash.replace('#/tool/', '').split('?')[0];
    if (slug === 'electricity-calculator' || slug === 'electricity-bill-calculator') {
      return { view: { type: 'all-tools' }, redirectPath: `/tools${search}` };
    }
    return { view: { type: 'tool', slug }, redirectPath: `/tool/${slug}${search}` };
  }
  if (hash.startsWith('#/category/')) {
    const categoryId = hash.replace('#/category/', '') as CategoryId;
    return { view: { type: 'category', categoryId }, redirectPath: `/category/${categoryId}${search}` };
  }
  if (hash === '#/all-tools' || hash === '#all-tools' || hash === '#/tools' || hash === '#tools') {
    return { view: { type: 'all-tools' }, redirectPath: `/tools${search}` };
  }
  if (hash === '#/categories' || hash === '#categories') {
    return { view: { type: 'all-tools' }, redirectPath: `/categories${search}` };
  }
  if (hash === '#/favorites' || hash === '#favorites' || hash === '#/saved' || hash === '#saved') {
    return { view: { type: 'favorites' }, redirectPath: `/favorites${search}` };
  }
  if (hash === '#/contact' || hash === '#contact') {
    return { view: { type: 'contact' }, redirectPath: `/contact${search}` };
  }
  if (hash === '#/request-tool' || hash === '#request-tool') {
    return { view: { type: 'request-tool' }, redirectPath: `/request-tool${search}` };
  }
  if (hash === '#/about' || hash === '#about') {
    return { view: { type: 'legal', page: 'about' }, redirectPath: `/about${search}` };
  }
  if (hash === '#/privacy' || hash === '#privacy') {
    return { view: { type: 'legal', page: 'privacy' }, redirectPath: `/legal/privacy${search}` };
  }
  if (hash === '#/terms' || hash === '#terms') {
    return { view: { type: 'legal', page: 'terms' }, redirectPath: `/legal/terms${search}` };
  }
  if (hash === '#/disclaimer' || hash === '#disclaimer') {
    return { view: { type: 'legal', page: 'disclaimer' }, redirectPath: `/legal/disclaimer${search}` };
  }
  if (hash.startsWith('#/legal/')) {
    const page = hash.replace('#/legal/', '') as any;
    if (page === 'contact') {
      return { view: { type: 'contact' }, redirectPath: `/contact${search}` };
    }
    const targetPath = page === 'about' ? '/about' : `/legal/${page}`;
    return { view: { type: 'legal', page }, redirectPath: `${targetPath}${search}` };
  }
  if (hash.startsWith('#/admin') || hash.startsWith('#admin')) {
    return { view: { type: 'home' }, redirectPath: '/' };
  }

  // 2. Parse Clean Pathname
  if (path.startsWith('/tool/')) {
    const slug = path.replace('/tool/', '').split('?')[0];
    if (slug === 'electricity-calculator' || slug === 'electricity-bill-calculator') {
      return { view: { type: 'all-tools' }, redirectPath: `/tools${search}` };
    }
    return { view: { type: 'tool', slug } };
  }
  if (path.startsWith('/category/')) {
    const categoryId = path.replace('/category/', '').split('?')[0] as CategoryId;
    return { view: { type: 'category', categoryId } };
  }
  if (path === '/tools' || path === '/all-tools' || path === '/categories') {
    return { view: { type: 'all-tools' } };
  }
  if (path === '/favorites' || path === '/saved') {
    return { view: { type: 'favorites' } };
  }
  if (path === '/contact') {
    return { view: { type: 'contact' } };
  }
  if (path === '/request-tool') {
    return { view: { type: 'request-tool' } };
  }
  if (path === '/about') {
    return { view: { type: 'legal', page: 'about' } };
  }
  if (path === '/privacy' || path === '/legal/privacy') {
    return { view: { type: 'legal', page: 'privacy' } };
  }
  if (path === '/terms' || path === '/legal/terms') {
    return { view: { type: 'legal', page: 'terms' } };
  }
  if (path === '/disclaimer' || path === '/legal/disclaimer') {
    return { view: { type: 'legal', page: 'disclaimer' } };
  }
  if (path.startsWith('/legal/')) {
    const page = path.replace('/legal/', '').split('?')[0] as any;
    if (page === 'contact') {
      return { view: { type: 'contact' } };
    }
    return { view: { type: 'legal', page } };
  }
  if (path.startsWith('/admin')) {
    return { view: { type: 'home' }, redirectPath: '/' };
  }

  // Root or unhandled paths -> home
  return { view: { type: 'home' } };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation View State
  const [view, setViewState] = useState<ViewMode>(() => {
    const { view: initialView, redirectPath } = parseCurrentLocation();
    if (redirectPath) {
      window.history.replaceState({}, '', redirectPath);
    }
    return initialView;
  });

  const [currentToolParams, setCurrentToolParams] = useState<Record<string, any>>({});

  // Theme & Accent State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('bu_theme') as ThemeMode) || 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('bu_accent') as AccentColor) || 'indigo';
  });

  // Favorites & Recents
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bu_favorites');
      return saved ? JSON.parse(saved) : ['emi-calculator', 'gst-calculator', 'salary-calculator', 'sip-calculator'];
    } catch {
      return ['emi-calculator', 'gst-calculator', 'salary-calculator'];
    }
  });

  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bu_recents');
      return saved ? JSON.parse(saved) : ['emi-calculator', 'age-calculator', 'gst-calculator'];
    } catch {
      return ['emi-calculator'];
    }
  });

  const [calculationHistory, setCalculationHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bu_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Command palette & Toast
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Apply Theme & Accent to document
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    root.setAttribute('data-accent', accent);
    localStorage.setItem('bu_theme', theme);
    localStorage.setItem('bu_accent', accent);

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, accent]);

  // Persist Favorites & Recents
  useEffect(() => {
    localStorage.setItem('bu_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('bu_recents', JSON.stringify(recentTools));
  }, [recentTools]);

  useEffect(() => {
    localStorage.setItem('bu_calc_history', JSON.stringify(calculationHistory));
  }, [calculationHistory]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Sync browser popstate and hashchange to View State
  useEffect(() => {
    const handlePopState = () => {
      const { view: parsedView, redirectPath } = parseCurrentLocation();
      if (redirectPath) {
        window.history.replaceState({}, '', redirectPath);
      }
      setViewState(parsedView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Synchronize SEO Title, Canonical URL, Open Graph & Schema.org JSON-LD
  useEffect(() => {
    updateSeoMetadata(view);
  }, [view]);

  const setView = (newView: ViewMode) => {
    setViewState(newView);

    const targetPath = getPathForView(newView);
    const currentSearch = window.location.search || '';
    const newUrl = targetPath + (targetPath.includes('?') ? '' : currentSearch);

    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({}, '', newUrl);
    }

    if (newView.type === 'tool') {
      addRecentTool(newView.slug);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.location.href = 'https://arrjs-central-admin.netlify.app/';
  };

  const navigateToTool = (slug: string, params?: Record<string, any>) => {
    if (params) {
      setCurrentToolParams(params);
    } else {
      setCurrentToolParams({});
    }
    setView({ type: 'tool', slug });
  };

  const navigateToCategory = (categoryId: CategoryId) => {
    setView({ type: 'category', categoryId });
  };

  const navigateToHome = () => {
    setView({ type: 'home' });
  };

  const navigateToAllTools = () => {
    setView({ type: 'all-tools' });
  };

  const navigateToFavorites = () => {
    setView({ type: 'favorites' });
  };

  const navigateToLegal = (page: 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact') => {
    setView({ type: 'legal', page });
  };

  const navigateToContact = () => {
    setView({ type: 'contact' });
  };

  const navigateToRequestTool = () => {
    setView({ type: 'request-tool' });
  };

  const toggleFavorite = (toolSlug: string) => {
    setFavorites(prev => {
      const exists = prev.includes(toolSlug);
      const updated = exists ? prev.filter(s => s !== toolSlug) : [...prev, toolSlug];
      showToast(exists ? 'Removed from favorites' : 'Saved to Favorites ⭐', exists ? 'info' : 'success');
      return updated;
    });
  };

  const isFavorite = (toolSlug: string) => favorites.includes(toolSlug);

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('bu_favorites');
    showToast('All saved favorites cleared', 'info');
  };

  const reorderFavorites = (newOrder: string[]) => {
    setFavorites(newOrder);
  };

  const addRecentTool = (toolSlug: string) => {
    setRecentTools(prev => {
      const filtered = prev.filter(s => s !== toolSlug);
      return [toolSlug, ...filtered].slice(0, 12);
    });
  };

  const removeRecentTool = (toolSlug: string) => {
    setRecentTools(prev => prev.filter(s => s !== toolSlug));
    showToast('Removed from recently used', 'info');
  };

  const clearRecentTools = () => {
    setRecentTools([]);
    localStorage.removeItem('bu_recents');
    showToast('Recently used tools cleared', 'info');
  };

  const clearAllPreferences = () => {
    try {
      localStorage.removeItem('bu_favorites');
      localStorage.removeItem('bu_recents');
      localStorage.removeItem('bu_recent_searches');
      localStorage.removeItem('bu_calc_history');
      localStorage.removeItem('bu_pwa_dismissed');
      setFavorites([]);
      setRecentTools([]);
      setCalculationHistory([]);
      showToast('All local BharatUtility preferences cleared', 'info');
    } catch {}
  };

  const addCalculationHistory = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    setCalculationHistory(prev => [newItem, ...prev.filter(h => h.summary !== item.summary)].slice(0, 20));
  };

  const clearHistory = () => {
    setCalculationHistory([]);
    showToast('Calculation history cleared', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3000);
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    showToast(`Switched to ${t} theme`, 'info');
  };

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    showToast(`Accent set to ${a.toUpperCase()}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        navigateToTool,
        navigateToCategory,
        navigateToHome,
        navigateToAllTools,
        navigateToFavorites,
        navigateToLegal,
        navigateToContact,
        navigateToRequestTool,
        navigateToAdmin,
        theme,
        setTheme,
        accent,
        setAccent,
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        reorderFavorites,
        recentTools,
        addRecentTool,
        removeRecentTool,
        clearRecentTools,
        clearAllPreferences,
        calculationHistory,
        addCalculationHistory,
        clearHistory,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        toast,
        showToast,
        currentToolParams
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
