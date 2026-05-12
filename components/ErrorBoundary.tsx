'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[v0] Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.) in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-8">
                {/* Error Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-700">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                </div>

                {/* Error Message */}
                <h2 className="text-xl font-bold text-neutral-50 text-center mb-2">
                  Something went wrong
                </h2>
                <p className="text-neutral-400 text-center text-sm mb-4">
                  We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>

                {/* Error Details (Visible to user) */}
                {this.state.error && (
                  <div className="mb-6 p-3 bg-red-900/20 rounded border border-red-700">
                    <p className="text-xs font-mono text-red-400 break-words">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={this.handleReset}
                    className="w-full px-4 py-2 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-lime-400 hover:border-lime-400 font-medium rounded-lg transition"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
