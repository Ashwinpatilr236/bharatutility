import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
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
    console.error('[BharatUtility] Global Uncaught Error:', error, errorInfo);

    // Auto-reload on dynamic chunk loading errors (caused by new deployments)
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk');

    if (isChunkError) {
      const reloadKey = 'bu_chunk_reload_attempt';
      const lastAttempt = sessionStorage.getItem(reloadKey);
      if (!lastAttempt || Date.now() - Number(lastAttempt) > 10000) {
        sessionStorage.setItem(reloadKey, String(Date.now()));
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-display tracking-tight text-white">
                Application Reload Required
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                BharatUtility was updated or encountered a temporary browser loading issue. Please reload to load the latest version.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload BharatUtility</span>
              </button>

              <button
                onClick={this.handleResetCacheAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache & Refresh</span>
              </button>

              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-2 px-4 text-neutral-400 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
