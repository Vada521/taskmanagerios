'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { TaskProvider } from '../contexts/TaskContext';
import { MissionProvider } from '../contexts/MissionContext';
import { HabitProvider } from '../contexts/HabitContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TaskProvider>
        <MissionProvider>
          <HabitProvider>
            {children}
          </HabitProvider>
        </MissionProvider>
      </TaskProvider>
    </SessionProvider>
  );
} 