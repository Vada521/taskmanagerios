'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ошибка в компоненте:', error);
    console.error('Информация об ошибке:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Что-то пошло не так
            </h2>
            <p className="text-gray-300 mb-4">
              Произошла ошибка при отображении этого компонента.
            </p>
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm font-mono text-gray-300">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 