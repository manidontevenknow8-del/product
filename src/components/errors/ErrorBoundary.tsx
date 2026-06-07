import { Component, type ErrorInfo, type ReactNode } from 'react';
import { GlobalErrorPage } from './GlobalErrorPage';
import { eventTracker } from '@/analytics/EventTracker';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    eventTracker.track('error_occurred', {
      message: error.message,
      componentStack: info.componentStack?.slice(0, 200) ?? 'unknown',
    });
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <GlobalErrorPage
          error={this.state.error}
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
