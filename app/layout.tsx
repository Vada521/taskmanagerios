import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './components/Providers';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { PageLoadingFallback } from './components/shared/LoadingFallback';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GamePlanner',
  description: 'Игровой планировщик задач',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={<PageLoadingFallback />}>
              {children}
            </Suspense>
            <Toaster position="bottom-right" />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
} 