import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 24,
            background: '#1a1416',
            color: '#fce7f3',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ color: '#ec4899', marginBottom: 16 }}>Something went wrong</h1>
          <pre
            style={{
              background: '#0a0809',
              padding: 16,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 14,
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: 16, opacity: 0.8 }}>
            Check the browser console (F12) for more details.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
