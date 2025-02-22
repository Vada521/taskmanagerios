'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  xpReward: number;
  progress: number;
  target: number;
  level: string;
  achieved: boolean;
  achievedAt: Date | null;
}

interface AchievementContextType {
  achievements: Achievement[];
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  checkAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
}

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Загрузка достижений
  useEffect(() => {
    const fetchAchievements = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/achievements');
          const data = await response.json();
          setAchievements(data);
        } catch (error) {
          console.error('Ошибка при загрузке достижений:', error);
        }
      }
    };

    fetchAchievements();
  }, [session]);

  // Обновление прогресса достижения
  const updateAchievementProgress = async (achievementId: string, progress: number) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении достижения');

      const updatedAchievement = await response.json();
      setAchievements(prev =>
        prev.map(achievement =>
          achievement.id === achievementId ? updatedAchievement : achievement
        )
      );
    } catch (error) {
      console.error('Ошибка при обновлении достижения:', error);
    }
  };

  // Проверка достижений
  const checkAchievements = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Ошибка при проверке достижений');

      const updatedAchievements = await response.json();
      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Ошибка при проверке достижений:', error);
    }
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        updateAchievementProgress,
        checkAchievements,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
} 