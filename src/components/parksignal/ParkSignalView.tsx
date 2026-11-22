import React, { useState } from 'react';
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
import { Shield, HelpCircle, ArrowLeft, User, Camera } from 'lucide-react';
import { parkSignalService } from '../../services/parkSignalService';

export const ParkSignalView: React.FC = () => {
  const { view, navigateToParkSignal, navigateToHome } = useApp();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  if (view.type !== 'parksignal') return null;

  const isAlertView = view.subView === 'alert';
  const currentUser = parkSignalService.getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sub-navigation bar for ParkSignal (hidden on scanner alert view for maximum focus) */}
      {!isAlertView && (
        <div className="border-b border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-14 sm:top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={navigateToHome}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                title="Return to BharatUtility Home"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> BharatUtility
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">/</span>
              <button
                onClick={() => navigateToParkSignal('landing')}
                className="font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                title="ParkSignal by BharatUtility"
              >
                <ParkSignalLogo variant="emblem" height={26} />
                <span className="font-extrabold text-neutral-900 dark:text-white text-xs tracking-tight">
                  PARK<span className="text-cyan-500">SIGNAL</span>
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScanModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                title="Scan or enter vehicle QR code"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={() => navigateToParkSignal('help')}
                className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
              >
                Help & Guide
              </button>
              <button
                onClick={() => navigateToParkSignal('privacy')}
                className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold hidden sm:inline-block"
              >
                Privacy
              </button>

              {currentUser ? (
                <button
                  onClick={() => navigateToParkSignal('dashboard')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
                >
                  <User className="w-3.5 h-3.5" /> Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigateToParkSignal('login')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                >
                  Owner Login
                </button>
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
