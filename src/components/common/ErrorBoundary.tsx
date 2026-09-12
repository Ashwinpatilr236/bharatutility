import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
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
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);

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

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[350px] w-full p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-rose-500/30 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-bold font-display tracking-tight text-white">
              {this.props.fallbackTitle || 'Tool Calculation Issue'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              An unexpected issue occurred while processing this calculation. The rest of BharatUtility remains fully functional.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Calculation</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
