'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TodoList from './components/Todo';
import HabitTracker from './components/HabitTracker';
import Missions from './components/Missions';
import AuthForm from './components/AuthForm';
import { useTaskContext } from './contexts/TaskContext';
import { useMissionContext } from './contexts/MissionContext';
import { LoadingFallback } from './components/shared/LoadingFallback';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tasks, toggleTaskCompletion, deleteTask } = useTaskContext();
  const { missions, deleteMission, updateMissionProgress } = useMissionContext();

  console.log('Home: Rendering with session status:', status, 'Session data:', session);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingFallback />;
  }

  if (status === 'authenticated') {
    return <LoadingFallback />;
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">🎮 Игровой Планировщик</h1>
            <p className="text-gray-400">Превратите свои задачи в увлекательное приключение!</p>
          </div>
          <AuthForm />
        </div>
      </main>
    );
  }

  console.log('Home: Rendering main content');
  return (
    <main className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🎮 Игровой Планировщик</h1>
          <p className="text-gray-400">Превратите свои задачи в увлекательное приключение!</p>
          <div className="mt-4 text-white">
            Привет, {session.user?.name || 'Герой'}! | XP: {session.user?.xp || 0} | Уровень: {session.user?.level || 1}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <TodoList 
            todos={tasks} 
            onDelete={deleteTask} 
            onToggle={toggleTaskCompletion} 
          />
          <HabitTracker />
          <Missions 
            missions={missions}
            onDelete={deleteMission}
            onProgressUpdate={updateMissionProgress}
          />
        </div>
      </div>
    </main>
  );
} 