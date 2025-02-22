'use client';

import { useSession } from 'next-auth/react';
import { CurrencyDollarIcon, FireIcon } from '@heroicons/react/24/outline';

const calculateProgressToNextLevel = (xp: number) => {
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let requiredXP = baseXP;
  
  while (xp >= requiredXP) {
    level++;
    requiredXP = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }
  
  const previousLevelXP = Math.floor(baseXP * Math.pow(multiplier, level - 2));
  const progress = xp - previousLevelXP;
  const requiredForNext = requiredXP - previousLevelXP;
  
  return { progress, requiredForNext, currentLevel: level };
};

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading' || !session?.user) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-20 h-8 bg-gray-700 rounded-lg"></div>
        <div className="w-48 h-8 bg-gray-700 rounded-lg"></div>
        <div className="w-32 h-8 bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const progress = calculateProgressToNextLevel(session.user.xp || 0);
  const progressPercentage = (progress.progress / progress.requiredForNext) * 100;

  return (
    <div className="flex items-center gap-4">
      {/* Золотые монеты */}
      <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
        <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
        <span className="text-yellow-500 font-medium">{session.user.gold || 0}</span>
      </div>

      {/* Уровень и опыт */}
      <div className="flex items-center gap-2 bg-purple-500/10 px-6 py-2 rounded-lg min-w-[250px]">
        <FireIcon className="w-5 h-5 text-purple-500" />
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center gap-4">
            <span className="text-purple-500 font-medium whitespace-nowrap">Уровень {progress.currentLevel}</span>
            <span className="text-purple-500/70 text-sm whitespace-nowrap">
              {progress.progress}/{progress.requiredForNext} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-purple-500/20 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Имя пользователя */}
      <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
        <img
          src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`}
          alt={session.user.name || ''}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-white font-medium">{session.user.name}</span>
      </div>
    </div>
  );
} 