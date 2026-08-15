import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccentColor, CalculationHistoryItem, CategoryId, ThemeMode, ViewMode } from '../types';
import { AdminSection } from '../types/admin';
import { getToolBySlug } from '../data/toolsRegistry';

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
  navigateToAdminTariffs: () => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation View State
  const [view, setViewState] = useState<ViewMode>(() => {
    // Parse URL on initial load
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.startsWith('#/tool/')) {
      const slug = hash.replace('#/tool/', '').split('?')[0];
      return { type: 'tool', slug };
    }
    if (hash.startsWith('#/category/')) {
      const categoryId = hash.replace('#/category/', '') as CategoryId;
      return { type: 'category', categoryId };
    }
    if (hash === '#/all-tools' || hash === '#all-tools') {
      return { type: 'all-tools' };
    }
    if (hash === '#/favorites' || hash === '#favorites' || hash === '#/saved' || hash === '#saved' || path === '/favorites') {
      return { type: 'favorites' };
    }
    if (hash === '#/contact' || hash === '#contact' || path === '/contact') {
      return { type: 'contact' };
    }
    if (hash === '#/request-tool' || hash === '#request-tool' || path === '/request-tool') {
      return { type: 'request-tool' };
    }
    if (
      hash.startsWith('#/admin') ||
      hash.startsWith('#admin') ||
      path.startsWith('/admin') ||
      hash.includes('access_token=') ||
      hash.includes('type=magiclink') ||
      hash.includes('type=recovery') ||
      hash.includes('type=invite') ||
      search.includes('type=magiclink') ||
      search.includes('type=recovery') ||
      search.includes('code=')
    ) {
      const cleanHash = hash.replace(/^#\/?/, '');
      const parts = cleanHash.split('/');
      // parts[0] === 'admin'
      const section = (parts[1] && !parts[1].includes('=') ? parts[1] : 'dashboard') as AdminSection;
      const subParam = parts[2];
      return { type: 'admin', section, subParam };
    }
    if (hash.startsWith('#/legal/')) {
      const page = hash.replace('#/legal/', '') as any;
      if (page === 'contact') {
        return { type: 'contact' };
      }
      return { type: 'legal', page };
    }
    return { type: 'home' };
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

  // Hash & Popstate routing sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tool/')) {
        const slug = hash.replace('#/tool/', '').split('?')[0];
        setViewState({ type: 'tool', slug });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#/category/')) {
        const categoryId = hash.replace('#/category/', '') as CategoryId;
        setViewState({ type: 'category', categoryId });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/all-tools' || hash === '#all-tools') {
        setViewState({ type: 'all-tools' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/favorites' || hash === '#favorites' || hash === '#/saved' || hash === '#saved') {
        setViewState({ type: 'favorites' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/contact' || hash === '#contact') {
        setViewState({ type: 'contact' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/request-tool' || hash === '#request-tool') {
        setViewState({ type: 'request-tool' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (
        hash.startsWith('#/admin') ||
        hash.startsWith('#admin') ||
        hash.includes('access_token=') ||
        hash.includes('type=magiclink') ||
        hash.includes('type=recovery') ||
        hash.includes('type=invite')
      ) {
        const cleanHash = hash.replace(/^#\/?/, '');
        const parts = cleanHash.split('/');
        const section = (parts[1] && !parts[1].includes('=') ? parts[1] : 'dashboard') as AdminSection;
        const subParam = parts[2];
        setViewState({ type: 'admin', section, subParam });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#/legal/')) {
        const page = hash.replace('#/legal/', '') as any;
        if (page === 'contact') {
          setViewState({ type: 'contact' });
        } else {
          setViewState({ type: 'legal', page });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '' || hash === '#' || hash === '#/') {
        setViewState({ type: 'home' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update Page Title and Meta on View changes
  useEffect(() => {
    if (view.type === 'tool') {
      const tool = getToolBySlug(view.slug);
      if (tool) {
        document.title = `${tool.name} — BharatUtility`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', tool.seo.description);
      }
    } else if (view.type === 'category') {
      document.title = `${view.categoryId.toUpperCase()} Tools & Calculators — BharatUtility`;
    } else if (view.type === 'all-tools') {
      document.title = `All Indian Calculators & Everyday Utilities — BharatUtility`;
    } else if (view.type === 'favorites') {
      document.title = `Saved Tools & Favorites — BharatUtility India`;
    } else if (view.type === 'contact') {
      document.title = `Contact Us & Feedback — BharatUtility`;
    } else if (view.type === 'request-tool') {
      document.title = `Request a Tool or Calculator — BharatUtility`;
    } else if (view.type === 'legal') {
      document.title = `${view.page.toUpperCase()} — BharatUtility India`;
    } else {
      document.title = `BharatUtility — Useful Tools for Everyday India`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', 'Free, fast, and modern everyday calculators and utilities built for India.');
    }
  }, [view]);

  const setView = (newView: ViewMode) => {
    setViewState(newView);
    if (newView.type === 'tool') {
      window.location.hash = `#/tool/${newView.slug}`;
      addRecentTool(newView.slug);
    } else if (newView.type === 'category') {
      window.location.hash = `#/category/${newView.categoryId}`;
    } else if (newView.type === 'all-tools') {
      window.location.hash = `#/all-tools`;
    } else if (newView.type === 'favorites') {
      window.location.hash = `#/favorites`;
    } else if (newView.type === 'contact') {
      window.location.hash = `#/contact`;
    } else if (newView.type === 'request-tool') {
      window.location.hash = `#/request-tool`;
    } else if (newView.type === 'admin') {
      window.location.hash = newView.section ? `#/admin/${newView.section}` : `#/admin`;
    } else if (newView.type === 'admin-tariffs') {
      window.location.hash = `#/admin/electricity-tariffs`;
    } else if (newView.type === 'legal') {
      window.location.hash = `#/legal/${newView.page}`;
    } else {
      window.location.hash = '#/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = (section: AdminSection = 'dashboard', subParam?: string) => {
    setView({ type: 'admin', section, subParam });
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

  const navigateToAdminTariffs = () => {
    setView({ type: 'admin-tariffs' });
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
        navigateToAdminTariffs,
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
