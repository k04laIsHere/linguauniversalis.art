import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Логирование ошибки
    console.error('=== ERROR BOUNDARY CAUGHT ===');
    console.error('Component:', this.props.name || 'Unknown');
    console.error('Error:', error);
    console.error('Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#ff0000', margin: '0 0 20px 0' }}>
            ❌ Component Error
          </h2>
          {this.props.name && <p><strong>Component:</strong> {this.props.name}</p>}
          {this.state.error && (
            <p><strong>Error:</strong> {this.state.error.message}</p>
          )}
          {this.props.fallback || <p>Something went wrong. Check the console.</p>}
        </div>
      );
    }

    return this.props.children;
  }
}

// Хук для отслеживания визуальных проблем
export const useViewportWatch = () => {
  React.useEffect(() => {
    let lastScrollY = 0;
    let lastViewportHeight = 0;

    const checkViewport = () => {
      const currentScrollY = window.scrollY;
      const currentViewportHeight = window.innerHeight;

      // Проверка резких скачков (что-то перекрывает контент)
      if (Math.abs(currentScrollY - lastScrollY) > 500) {
        console.warn('⚠️ Large scroll jump detected:', {
          from: lastScrollY,
          to: currentScrollY,
          delta: Math.abs(currentScrollY - lastScrollY)
        });
      }

      // Проверка изменения viewport height (что-то блокирует контент)
      if (Math.abs(currentViewportHeight - lastViewportHeight) > 50) {
        console.warn('⚠️ Viewport height changed drastically:', {
          from: lastViewportHeight,
          to: currentViewportHeight,
          delta: Math.abs(currentViewportHeight - lastViewportHeight)
        });
      }

      lastScrollY = currentScrollY;
      lastViewportHeight = currentViewportHeight;
    };

    // Проверять каждые 2 секунды
    const interval = setInterval(checkViewport, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
};
