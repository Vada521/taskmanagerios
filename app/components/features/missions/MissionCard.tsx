import { memo, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrashIcon,
  PencilIcon,
  ChartBarIcon,
  CheckIcon,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Mission } from '@/app/contexts/MissionContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MissionCardProps {
  mission: Mission;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleDashboard: (id: string) => Promise<void>;
  onProgressUpdate: (id: string, progress: number) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
}

const MissionCard = memo(function MissionCard({
  mission,
  onEdit,
  onDelete,
  onToggleDashboard,
  onProgressUpdate,
  onArchive,
}: MissionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editedProgress, setEditedProgress] = useState(mission.progress);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(mission.id);
    } catch (error) {
      console.error('Ошибка при удалении миссии:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [mission.id, onDelete, isDeleting]);

  const handleProgressUpdate = useCallback(async () => {
    if (isUpdating || editedProgress === mission.progress) {
      setIsEditingProgress(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onProgressUpdate(mission.id, editedProgress);
      setIsEditingProgress(false);
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error);
      setEditedProgress(mission.progress);
    } finally {
      setIsUpdating(false);
    }
  }, [mission.id, mission.progress, editedProgress, onProgressUpdate, isUpdating]);

  const handleToggleDashboard = useCallback(async () => {
    try {
      await onToggleDashboard(mission.id);
    } catch (error) {
      console.error('Ошибка при изменении статуса на дашборде:', error);
    }
  }, [mission.id, onToggleDashboard]);

  const progressPercentage = useMemo(() => 
    (mission.progress / mission.target) * 100,
    [mission.progress, mission.target]
  );

  const chartData = useMemo(() => {
    if (!mission.progressHistory || mission.progressHistory.length === 0) return null;

    const sortedHistory = [...mission.progressHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedHistory.map(entry => format(new Date(entry.date), 'd MMM', { locale: ru })),
      datasets: [
        {
          label: 'Прогресс',
          data: sortedHistory.map(entry => entry.progress),
          fill: false,
          borderColor: mission.color,
          backgroundColor: mission.color,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [mission.progressHistory, mission.color]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: mission.target,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        displayColors: false
      }
    }
  }), [mission.target]);

  return (
    <motion.div
      className="bg-gray-700 rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout="position"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white">{mission.title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowProgressChart(!showProgressChart)}
            className="p-1 hover:bg-gray-600 rounded"
            aria-label="показать график"
          >
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(mission.id)}
            className="p-1 hover:bg-gray-600 rounded"
            aria-label="редактировать"
          >
            <PencilIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 hover:bg-gray-600 rounded"
            aria-label="удалить"
          >
            <TrashIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleToggleDashboard}
            className={`p-1 hover:bg-gray-600 rounded ${
              mission.isOnDashboard ? 'text-yellow-500' : 'text-gray-400'
            }`}
            aria-label="добавить на дашборд"
          >
            <StarIcon className="w-5 h-5" />
          </button>
          {mission.progress === mission.target && (
            <button
              onClick={() => onArchive(mission.id)}
              className="p-1 hover:bg-gray-600 rounded"
              aria-label="завершить"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </button>
          )}
        </div>
      </div>

      {mission.description && (
        <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {isEditingProgress ? (
            <input
              type="number"
              value={editedProgress}
              onChange={(e) => setEditedProgress(Number(e.target.value))}
              onBlur={handleProgressUpdate}
              onKeyPress={(e) => e.key === 'Enter' && handleProgressUpdate()}
              className="bg-gray-600 text-white px-2 py-1 rounded w-20"
              autoFocus
            />
          ) : (
            <div
              className="text-gray-300 cursor-pointer"
              onClick={() => setIsEditingProgress(true)}
            >
              {mission.progress} / {mission.target} {mission.unit}
            </div>
          )}
          {progressPercentage >= 100 && !mission.status && (
            <button
              onClick={() => onArchive(mission.id)}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 rounded-lg text-white text-sm"
              aria-label="завершить"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Завершить</span>
            </button>
          )}
        </div>

        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full transition-all duration-300"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: mission.color
            }}
          />
        </div>

        {showProgressChart && chartData && (
          <div className="mt-4 h-40 bg-gray-800 rounded-lg p-2">
            <Line
              data={chartData}
              options={chartOptions}
            />
          </div>
        )}

        {mission.startDate && mission.endDate && (
          <div className="text-sm text-gray-400">
            {format(new Date(mission.startDate), 'd MMM', { locale: ru })} -{' '}
            {format(new Date(mission.endDate), 'd MMM yyyy', { locale: ru })}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default MissionCard; 