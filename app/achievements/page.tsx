'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../components/DashboardLayout';

interface Achievement {
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
  achievedAt: string | null;
}

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAchievements = async () => {
      try {
        setLoading(true);
        // Пытаемся инициализировать достижения
        await fetch('/api/achievements/initialize', {
          method: 'POST',
        });
        
        // Получаем список достижений
        const response = await fetch('/api/achievements');
        if (!response.ok) {
          throw new Error('Ошибка при получении достижений');
        }
        const data = await response.json();
        setAchievements(data);
      } catch (error) {
        console.error('Ошибка при получении достижений:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      initializeAchievements();
    }
  }, [session]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      basic: 'bg-blue-500/20 text-blue-500',
      time: 'bg-green-500/20 text-green-500',
      social: 'bg-purple-500/20 text-purple-500',
      humor: 'bg-yellow-500/20 text-yellow-500',
      complex: 'bg-red-500/20 text-red-500',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-500';
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      bronze: 'bg-amber-600/20 text-amber-600',
      silver: 'bg-gray-400/20 text-gray-400',
      gold: 'bg-yellow-400/20 text-yellow-400',
    };
    return colors[level] || 'bg-gray-500/20 text-gray-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 text-white">Достижения</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Достижения</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all ${
                achievement.achieved ? 'border-2 border-green-500' : 'border border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{achievement.name}</h2>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                    {achievement.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(achievement.level)}`}>
                    {achievement.level}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{achievement.description}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Прогресс: {achievement.progress}/{achievement.target}</span>
                  <span className="text-purple-500 font-medium">+{achievement.xpReward} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      achievement.achieved ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {achievement.achieved && achievement.achievedAt && (
                <div className="text-sm text-gray-400">
                  Получено: {new Date(achievement.achievedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">
              У вас пока нет достижений. Выполняйте задачи и миссии, чтобы получать их!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 