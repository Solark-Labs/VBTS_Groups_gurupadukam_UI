import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[Guru Padukam UI] Caught render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-amber-200 rounded-2xl shadow-lg p-8">
            <h1 className="text-xl font-bold text-[#4A0E0E] mb-2">
              Guru Padukam · Recovery Mode
            </h1>
            <p className="text-sm text-gray-600 mb-5">
              Something unexpected happened while loading this screen. Your bookings and wallet are safe.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#4A0E0E] text-white text-sm font-semibold hover:bg-[#621515] transition"
            >
              Reload Safely
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
