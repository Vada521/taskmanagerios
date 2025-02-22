import { useState } from 'react';
import { Mission } from '../contexts/MissionContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditMissionModalProps {
  mission: Mission;
  onClose: () => void;
  onSubmit: (updates: Partial<Mission>) => void;
}

export default function EditMissionModal({ mission, onClose, onSubmit }: EditMissionModalProps) {
  const [formData, setFormData] = useState({
    title: mission.title,
    description: mission.description || '',
    target: mission.target,
    unit: mission.unit,
    color: mission.color,
    startDate: mission.startDate ? new Date(mission.startDate).toISOString().split('T')[0] : '',
    endDate: mission.endDate ? new Date(mission.endDate).toISOString().split('T')[0] : '',
    progress: mission.progress
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Редактировать миссию</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Цель
              </label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Единица измерения
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Прогресс
            </label>
            <input
              type="number"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              required
              min="0"
              max={formData.target}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Цвет
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 bg-gray-700 rounded-lg px-2 py-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Дата начала
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Дата окончания
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 