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
import { ToolDiscoveryWidget } from './components/home/ToolDiscoveryWidget';
import { CategoryDetailPanel } from './components/home/CategoryDetailPanel';
import { YourFavoritesSection } from './components/home/YourFavoritesSection';
import { RecentlyUsedSection } from './components/home/RecentlyUsedSection';
import { TrustSection } from './components/home/TrustSection';
import { HomeFaqSection } from './components/home/HomeFaqSection';
import { FinalDiscoveryCtaSection } from './components/home/FinalDiscoveryCtaSection';
import { SanatanNextShowcaseSection } from './components/home/SanatanNextShowcaseSection';
import { SocialFollow } from './components/common/SocialFollow';
import { getToolBySlug } from './data/toolsRegistry';
import { ArrowLeft } from 'lucide-react';

import { LegalView } from './components/views/LegalView';
import { ContactView } from './components/views/ContactView';

import { InteractiveMiniTools } from './components/home/InteractiveMiniTools';
import { MobileNavDock } from './components/common/MobileNavDock';

// Code-split Lazy Loaded Views
const ToolPageLayout = React.lazy(() => import('./components/tools/ToolPageLayout').then(m => ({ default: m.ToolPageLayout })));
const CategoryView = React.lazy(() => import('./components/views/CategoryView').then(m => ({ default: m.CategoryView })));
const AllToolsView = React.lazy(() => import('./components/views/AllToolsView').then(m => ({ default: m.AllToolsView })));
const FavoritesView = React.lazy(() => import('./components/views/FavoritesView').then(m => ({ default: m.FavoritesView })));
const RequestToolView = React.lazy(() => import('./components/views/RequestToolView').then(m => ({ default: m.RequestToolView })));
const SanatanNextPromoView = React.lazy(() => import('./components/views/SanatanNextPromoView').then(m => ({ default: m.SanatanNextPromoView })));
const BlogHomeView = React.lazy(() => import('./components/views/BlogHomeView'));
const ArticleView = React.lazy(() => import('./components/views/ArticleView'));

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
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans transition-colors selection:bg-accent selection:text-white relative w-full overflow-x-hidden">
      {/* Global Offline Banner */}
      <OfflineStatusIndicator />

      {/* Global Header */}
      <Header />

      <main className="flex-1 pb-16 md:pb-0">
        {view.type === 'home' && (
          <div className="flex flex-col space-y-1.5 sm:space-y-3.5 py-0.5 sm:py-2">
            {/* 1. Hero & Smart Discovery Search */}
            <HeroSection />

            {/* 2. PWA Install App Banner */}
            <PwaInstallBanner />

            {/* 3. Tabbed Tool Discovery: Trending / Popular / New (3 → 1 widget) */}
            <ToolDiscoveryWidget />

            {/* 4. Category + Detail Panel: 2-col on desktop, chips+carousel on mobile */}
            <CategoryDetailPanel />

            {/* 5. Interactive Quick Calculators */}
            <InteractiveMiniTools />

            {/* 6. Personalized Sections (shown only when user has used tools) */}
            <YourFavoritesSection />
            <RecentlyUsedSection />

            {/* 7. Sister Project Showcase: Sanatan Next */}
            <SanatanNextShowcaseSection />

            {/* 8. Why BharatUtility & Privacy Trust */}
            <TrustSection />

            {/* 9. Concise Indian User FAQ */}
            <HomeFaqSection />

            {/* 10. Final Tool Discovery CTA */}
            <FinalDiscoveryCtaSection />
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

            {view.type === 'sanatan-next' && (
              <SanatanNextPromoView />
            )}

            {view.type === 'legal' && (
              <LegalView page={view.page} />
            )}

            {(view.type === 'blog' || view.type === 'guides') && (
              <BlogHomeView type={view.type} />
            )}

            {view.type === 'article' && (
              <ArticleView slug={view.slug} />
            )}
          </React.Suspense>
        </ErrorBoundary>
      </main>

      {/* Global Social Media Follow Section */}
      {view.type === 'home' && <SocialFollow />}

      {/* Global Footer */}
      <Footer showEcosystemPromo={view.type === 'home'} />

      {/* Global Mobile Bottom Navigation Dock */}
      <MobileNavDock />

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
