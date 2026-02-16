import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorScreen } from '../error-screen';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку в production-безопасный способ
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Определяем тип ошибки
      const errorMessage = this.state.error?.message || '';
      let errorType: 'noData' | 'serverError' | 'validationError' | 'networkError' | 'unknown' = 'unknown';

      if (
        errorMessage.includes('сервер') ||
        errorMessage.includes('server') ||
        errorMessage.includes('500') ||
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('504')
      ) {
        errorType = 'serverError';
      } else if (
        errorMessage.includes('валид') ||
        errorMessage.includes('validation') ||
        errorMessage.includes('400') ||
        errorMessage.includes('422')
      ) {
        errorType = 'validationError';
      } else if (
        errorMessage.includes('сеть') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch')
      ) {
        errorType = 'networkError';
      }

      return (
        <ErrorScreen
          errorType={errorType}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

