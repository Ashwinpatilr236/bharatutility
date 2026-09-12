import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CommandPalette } from './components/common/CommandPalette';
import { Toast } from './components/common/Toast';
import { OfflineStatusIndicator } from './components/common/OfflineStatusIndicator';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { RequestToolCta } from './components/common/RequestToolCta';

// Home View Sections (kept eager for instantaneous public home landing)
import { HeroSection } from './components/home/HeroSection';
import { PopularToolsSection } from './components/home/PopularToolsSection';
import { YourFavoritesSection } from './components/home/YourFavoritesSection';
import { RecentlyUsedSection } from './components/home/RecentlyUsedSection';
import { TrendingToolsSection } from './components/home/TrendingToolsSection';
import { NewToolsSection } from './components/home/NewToolsSection';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { TrustSection } from './components/home/TrustSection';
import { SocialFollow } from './components/common/SocialFollow';
import { getToolBySlug } from './data/toolsRegistry';
import { ArrowLeft } from 'lucide-react';

import { LegalView } from './components/views/LegalView';
import { ContactView } from './components/views/ContactView';

// Code-split Lazy Loaded Views
const ToolPageLayout = React.lazy(() => import('./components/tools/ToolPageLayout').then(m => ({ default: m.ToolPageLayout })));
const CategoryView = React.lazy(() => import('./components/views/CategoryView').then(m => ({ default: m.CategoryView })));
const AllToolsView = React.lazy(() => import('./components/views/AllToolsView').then(m => ({ default: m.AllToolsView })));
const FavoritesView = React.lazy(() => import('./components/views/FavoritesView').then(m => ({ default: m.FavoritesView })));
const RequestToolView = React.lazy(() => import('./components/views/RequestToolView').then(m => ({ default: m.RequestToolView })));

import { ErrorBoundary } from './components/common/ErrorBoundary';

const ViewLoadingFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
    <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-48"></div>
    <div className="h-28 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800"></div>
      <div className="h-64 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800"></div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { view, navigateToHome, toast } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors selection:bg-accent selection:text-white">
      {/* Global Offline Banner */}
      <OfflineStatusIndicator />

      {/* Global Header */}
      <Header />

      <main className="flex-1">
        {view.type === 'home' && (
          <div className="space-y-4 sm:space-y-8">
            {/* 1. Hero & Smart Discovery Search */}
            <HeroSection />

            {/* 2. PWA Install App Banner */}
            <PwaInstallBanner />

            {/* 3. Popular Tools */}
            <PopularToolsSection />

            {/* 4. Your Favorites (rendered only when user has saved favorites) */}
            <YourFavoritesSection />

            {/* 5. Recently Used (rendered only when user has recent tools) */}
            <RecentlyUsedSection />

            {/* 6. Trending Today (🔥 high volume tools) */}
            <TrendingToolsSection />

            {/* 7. New on BharatUtility (✨ latest tools) */}
            <NewToolsSection />

            {/* 8. Categories Showcase */}
            <CategoryShowcase />

            {/* 9. Request a Tool Community CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <RequestToolCta />
            </div>

            {/* 10. Trust & Privacy Section */}
            <TrustSection />
          </div>
        )}

        <ErrorBoundary>
          <React.Suspense fallback={<ViewLoadingFallback />}>
            {view.type === 'tool' && (() => {
              const tool = getToolBySlug(view.slug);
              if (!tool) {
                return (
                  <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
                    <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                      Tool Not Found
                    </h2>
                    <p className="text-sm text-neutral-500">
                      The calculator or utility you requested does not exist or has moved.
                    </p>
                    <button
                      onClick={navigateToHome}
                      className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-accent/90 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Return to Home
                    </button>
                  </div>
                );
              }
              return <ToolPageLayout tool={tool} />;
            })()}

            {view.type === 'category' && (
              <CategoryView categoryId={view.categoryId} />
            )}

            {view.type === 'all-tools' && (
              <AllToolsView />
            )}

            {view.type === 'favorites' && (
              <FavoritesView />
            )}

            {view.type === 'contact' && (
              <ContactView />
            )}

            {view.type === 'request-tool' && (
              <RequestToolView />
            )}

            {view.type === 'legal' && (
              <LegalView page={view.page} />
            )}
          </React.Suspense>
        </ErrorBoundary>
      </main>

      {/* Global Social Media Follow Section */}
      <SocialFollow />

      {/* Global Footer */}
      <Footer />

      {/* Global Command Palette & Toast Notifications */}
      <CommandPalette />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
