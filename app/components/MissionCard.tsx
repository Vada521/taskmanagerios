'use client';

import { useState } from 'react';
import { Mission } from '../contexts/MissionContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import MissionProgressChart from './MissionProgressChart';

interface MissionCardProps {
  mission: Mission;
  onEdit: (mission: Mission) => void;
  onDelete: (id: string) => void;
  onToggleDashboard: (id: string) => void;
  onProgressUpdate: (id: string, progress: number) => void;
  onArchive?: (id: string) => void;
}

export default function MissionCard({
  mission,
  onEdit,
  onDelete,
  onToggleDashboard,
  onProgressUpdate,
  onArchive
}: MissionCardProps) {
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editedProgress, setEditedProgress] = useState(mission.progress);

  const progressPercentage = (mission.progress / mission.target) * 100;

  const handleProgressSave = () => {
    if (editedProgress !== mission.progress) {
      onProgressUpdate(mission.id, editedProgress);
    }
    setIsEditingProgress(false);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white">{mission.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDashboard(mission.id)}
            className={`text-gray-400 hover:text-white transition-colors ${mission.isOnDashboard ? 'text-purple-500' : ''}`}
            title={mission.isOnDashboard ? "Убрать с дашборда" : "Добавить на дашборд"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </button>
          <button
            onClick={() => setShowProgressChart(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Показать график прогресса"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(mission.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mission.description && (
        <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
      )}

      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1">
          <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                backgroundColor: mission.progress >= mission.target ? '#22c55e' : mission.color
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setIsEditingProgress(true)}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-600 rounded"
          title="Изменить прогресс"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
        <span>{mission.progress} {mission.unit}</span>
        <span>из {mission.target} {mission.unit}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {mission.startDate && mission.endDate && (
            <span className="text-sm text-gray-400">
              {format(new Date(mission.startDate), 'd MMM', { locale: ru })} - {format(new Date(mission.endDate), 'd MMM yyyy', { locale: ru })}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {mission.progress >= mission.target && (
            <>
              <span className="text-sm text-green-500">Выполнено!</span>
              {onArchive && (
                <button
                  onClick={() => onArchive(mission.id)}
                  className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                  title="Переместить в архив"
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onEdit(mission)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditingProgress && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editedProgress}
              onChange={(e) => setEditedProgress(Number(e.target.value))}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
              min="0"
              max={mission.target}
            />
            <span className="text-gray-400">{mission.unit}</span>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditingProgress(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleProgressSave}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {showProgressChart && (
        <MissionProgressChart
          mission={mission}
          onClose={() => setShowProgressChart(false)}
        />
      )}
    </div>
  );
} 