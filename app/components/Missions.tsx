'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Mission {
  id: string;
  title: string;
  description?: string;
  folder: string;
  status: 'backlog' | 'in_progress' | 'completed';
  progress: number;
  target: number;
  unit: string;
  color: string;
  startDate?: Date;
  endDate?: Date;
  isOnDashboard: boolean;
  user: User;
}

interface MissionListProps {
  missions: Mission[];
  onDelete: (id: string) => void;
  onProgressUpdate: (id: string, progress: number) => void;
}

export default function MissionList({ missions, onDelete, onProgressUpdate }: MissionListProps) {
  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 66) return 'bg-yellow-500';
    if (percentage >= 33) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {missions.map((mission) => (
        <motion.div
          key={mission.id}
          className="bg-gray-800 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: mission.color }}
                />
                <h3 className="text-lg font-medium text-white">{mission.title}</h3>
              </div>
              {mission.description && (
                <p className="text-gray-400 text-sm mt-1 ml-6">{mission.description}</p>
              )}
              <div className="mt-3 ml-6">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-400">Прогресс:</span>
                  <span className="text-sm text-white">
                    {mission.progress} / {mission.target} {mission.unit}
                  </span>
                </div>
                <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${getProgressColor(
                      mission.progress,
                      mission.target
                    )}`}
                    style={{
                      width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => onProgressUpdate(mission.id, Math.max(0, mission.progress - 1))}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onProgressUpdate(mission.id, mission.progress + 1)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 ml-6">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {mission.folder}
                </span>
                {mission.startDate && (
                  <span className="text-xs text-gray-400">
                    {new Date(mission.startDate).toLocaleDateString()} -
                    {mission.endDate
                      ? new Date(mission.endDate).toLocaleDateString()
                      : ' Бессрочно'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDelete(mission.id)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <TrashIcon className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 