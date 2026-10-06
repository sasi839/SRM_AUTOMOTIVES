import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BillingErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('BillingModule crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-8 text-white bg-slate-950 rounded-b-2xl">
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-400 mb-2">Billing Module Error</h2>
            <p className="text-sm text-slate-400 mb-4">An error occurred while loading the Billing module.</p>
            <pre className="text-xs text-red-300 bg-slate-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
