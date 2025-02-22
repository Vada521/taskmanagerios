'use client';

import { ReactNode, memo } from 'react';
import { SessionProvider } from 'next-auth/react';
import { TaskProvider } from './contexts/TaskContext';
import { MissionProvider } from './contexts/MissionContext';
import { AchievementProvider } from './contexts/AchievementContext';

// Мемоизируем AuthenticatedProviders для предотвращения ненужных перерендеров
const AuthenticatedProviders = memo(function AuthenticatedProviders({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <TaskProvider>
      <MissionProvider>
        <AchievementProvider>
          {children}
        </AchievementProvider>
      </MissionProvider>
    </TaskProvider>
  );
});

// Основной провайдер приложения
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthenticatedProviders>
        {children}
      </AuthenticatedProviders>
    </SessionProvider>
  );
} 