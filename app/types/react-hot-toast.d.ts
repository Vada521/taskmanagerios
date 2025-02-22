import { ReactNode } from 'react';

declare module 'react-hot-toast' {
  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: {
      className?: string;
      duration?: number;
      style?: React.CSSProperties;
    };
    children?: ReactNode;
  }

  export const Toaster: React.FC<ToasterProps>;
  
  const toast: {
    (message: string): string;
    success: (message: string) => string;
    error: (message: string) => string;
    loading: (message: string) => string;
    dismiss: (toastId?: string) => void;
  };

  export default toast;
} 