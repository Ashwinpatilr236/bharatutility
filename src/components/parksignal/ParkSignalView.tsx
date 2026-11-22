import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ParkSignalLandingView } from './ParkSignalLandingView';
import { ParkSignalRegisterView } from './ParkSignalRegisterView';
import { ParkSignalLoginView } from './ParkSignalLoginView';
import { ParkSignalDashboardView } from './ParkSignalDashboardView';
import { ParkSignalAlertView } from './ParkSignalAlertView';
import { ParkSignalPrivacyView } from './ParkSignalPrivacyView';
import { ParkSignalHelpView } from './ParkSignalHelpView';
import { ParkSignalScanModal } from './ParkSignalScanModal';
import { ParkSignalLogo } from './ParkSignalLogo';
import { ArrowLeft, User, Camera, Car, LogOut, Shield } from 'lucide-react';
import { parkSignalService } from '../../services/parkSignalService';

export const ParkSignalView: React.FC = () => {
  const { view, navigateToParkSignal, navigateToHome, showToast } = useApp();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  if (view.type !== 'parksignal') return null;

  const isAlertView = view.subView === 'alert';
  const currentUser = parkSignalService.getCurrentUser();

  // Auto-route logged in owners to their dashboard instead of marketing landing
  useEffect(() => {
    if (currentUser && view.subView === 'landing') {
      navigateToParkSignal('dashboard');
    }
  }, [currentUser, view.subView, navigateToParkSignal]);

  const handleLogout = async () => {
    await parkSignalService.logout();
    showToast('Logged out securely.', 'info');
    navigateToParkSignal('landing');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sleek, Compact Sub-navigation bar (h-10, zero black boxes, zero wasted space) */}
      {!isAlertView && (
        <div className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-13 sm:top-14 z-30">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-10 sm:h-11 flex items-center justify-between gap-3 text-xs">
            {/* Left: Breadcrumb with Adaptive Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={navigateToHome}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 font-semibold transition-colors"
                title="Return to BharatUtility Home"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BharatUtility
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <button
                onClick={() => navigateToParkSignal(currentUser ? 'dashboard' : 'landing')}
                className="hover:opacity-90 transition-opacity flex items-center"
                title="ParkSignal by BharatUtility"
              >
                <ParkSignalLogo variant="full" height={24} />
              </button>
            </div>

            {/* Right: Quick Contextual Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer"
                title="Scan or enter vehicle QR code"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Scan QR</span>
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => navigateToParkSignal('vehicles')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                      view.subView === 'vehicles'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>My Vehicles</span>
                  </button>

                  <button
                    onClick={() => navigateToParkSignal('dashboard')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                      view.subView === 'dashboard'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigateToParkSignal('help')}
                    className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold hidden sm:inline-block"
                  >
                    Help & Guide
                  </button>
                  <button
                    onClick={() => navigateToParkSignal('privacy')}
                    className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold hidden md:inline-block"
                  >
                    Privacy
                  </button>
                  <button
                    onClick={() => navigateToParkSignal('login')}
                    className="px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                  >
                    Owner Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Subview Content */}
      <div className="flex-1">
        {view.subView === 'landing' && <ParkSignalLandingView />}
        {view.subView === 'register' && <ParkSignalRegisterView />}
        {view.subView === 'login' && <ParkSignalLoginView />}
        {view.subView === 'dashboard' && <ParkSignalDashboardView initialTab="overview" />}
        {view.subView === 'vehicles' && <ParkSignalDashboardView initialTab="vehicles" />}
        {view.subView === 'alert' && <ParkSignalAlertView token={view.token} />}
        {view.subView === 'privacy' && <ParkSignalPrivacyView />}
        {view.subView === 'help' && <ParkSignalHelpView />}
      </div>

      {/* Global ParkSignal Scan Modal */}
      <ParkSignalScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
