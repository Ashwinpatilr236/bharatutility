import React from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  isGlobal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: React.Component<Props, State>['setState'];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Diagnostic logging for developers without exposing raw stacks to end users
    console.error('Diagnostic error captured by BharatUtility ErrorBoundary:', {
      error: error?.message || error,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });

    // Auto-heal on dynamic chunk loading errors caused by new deployments
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk');

    if (isChunkError) {
      const reloadKey = 'bu_chunk_retry_' + window.location.pathname;
      const lastAttempt = sessionStorage.getItem(reloadKey);
      if (!lastAttempt || Date.now() - Number(lastAttempt) > 15000) {
        sessionStorage.setItem(reloadKey, String(Date.now()));
        window.location.reload();
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isGlobal = this.props.isGlobal ?? false;
      const title = this.props.fallbackTitle || 'Something went wrong';

      return (
        <div
          className={`${
            isGlobal ? 'min-h-screen w-full flex-col' : 'min-h-[360px] w-full my-6'
          } p-6 sm:p-10 rounded-3xl bg-neutral-900/90 dark:bg-black/90 border border-neutral-800 text-white flex items-center justify-center text-center shadow-2xl backdrop-blur-xl relative overflow-hidden`}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-5 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                An unexpected issue occurred while rendering this section. BharatUtility is safe and your settings remain intact.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload BharatUtility</span>
              </button>

              <button
                type="button"
                onClick={this.handleRetry}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 font-semibold transition-all flex items-center gap-2 cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 font-semibold transition-all flex items-center gap-2 cursor-pointer border border-white/10"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
