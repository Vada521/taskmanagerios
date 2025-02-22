'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useMissionContext, Mission } from '../contexts/MissionContext';
import MissionCard from '../components/MissionCard';
import {
  PlusIcon,
  XMarkIcon,
  FolderIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import EditMissionModal from '../components/EditMissionModal';

export default function MissionsPage() {
  const { data: session } = useSession();
  const {
    missions,
    folders,
    addMission,
    addFolder,
    updateMission,
    deleteMission,
    toggleMissionOnDashboard,
    updateMissionProgress,
    archiveMission
  } = useMissionContext();

  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    folder: '',
    target: 100,
    unit: '',
    color: '#4F46E5',
    startDate: '',
    endDate: '',
  });
  const [newFolder, setNewFolder] = useState({
    name: '',
    color: '#4F46E5',
  });

  const activeMissions = missions.filter(mission => mission.status !== 'completed');
  const archivedMissions = missions.filter(mission => mission.status === 'completed');

  // Группируем активные миссии по папкам
  const missionsByFolder = folders.map(folder => ({
    ...folder,
    missions: activeMissions.filter(mission => mission.folder === folder.id)
  }));

  const handleAddMission = () => {
    if (!newMission.title || !newMission.folder || !newMission.target || !newMission.unit) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const startDate = newMission.startDate ? new Date(newMission.startDate) : undefined;
    const endDate = newMission.endDate ? new Date(newMission.endDate) : undefined;

    if (startDate && endDate && startDate >= endDate) {
      alert('Дата начала должна быть меньше даты окончания');
      return;
    }

    addMission({
      ...newMission,
      startDate,
      endDate,
    });

    setNewMission({
      title: '',
      description: '',
      folder: '',
      target: 100,
      unit: '',
      color: '#4F46E5',
      startDate: '',
      endDate: '',
    });
    setShowNewMissionModal(false);
  };

  const handleAddFolder = () => {
    if (newFolder.name) {
      addFolder(newFolder);
      setNewFolder({
        name: '',
        color: '#4F46E5',
      });
      setShowNewFolderModal(false);
    }
  };

  const handleMissionEdit = (mission: Mission) => {
    setEditingMission(mission);
  };

  const handleEditSubmit = async (updates: Partial<Mission>) => {
    if (editingMission) {
      await updateMission(editingMission.id, updates);
      setEditingMission(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Миссии</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FolderIcon className="w-5 h-5" />
                <span>Новая папка</span>
              </button>
              <button
                onClick={() => setShowNewMissionModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Новая миссия</span>
              </button>
            </div>
          </div>

          {/* Активные миссии по папкам */}
          <div className="grid grid-cols-2 gap-6">
            {missionsByFolder.map(folder => (
              <div key={folder.id} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <h2 className="text-lg font-semibold text-white">{folder.name}</h2>
                  <span className="ml-auto text-sm text-gray-400">
                    {folder.missions.length} миссий
                  </span>
                </div>
                <div className="space-y-4">
                  {folder.missions.map(mission => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      onEdit={handleMissionEdit}
                      onDelete={deleteMission}
                      onToggleDashboard={toggleMissionOnDashboard}
                      onProgressUpdate={updateMissionProgress}
                      onArchive={archiveMission}
                    />
                  ))}
                  {folder.missions.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                      <p>Нет активных миссий</p>
                      <button
                        onClick={() => {
                          setNewMission(prev => ({ ...prev, folder: folder.id }));
                          setShowNewMissionModal(true);
                        }}
                        className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                      >
                        + Добавить миссию
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Архив миссий */}
          <div className="mt-8">
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRightIcon
                className={`w-5 h-5 transition-transform ${showArchive ? 'rotate-90' : ''}`}
              />
              <span>Архив миссий ({archivedMissions.length})</span>
            </button>

            {showArchive && (
              <div className="mt-4 space-y-4">
                {archivedMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onEdit={handleMissionEdit}
                    onDelete={deleteMission}
                    onToggleDashboard={toggleMissionOnDashboard}
                    onProgressUpdate={updateMissionProgress}
                    onArchive={archiveMission}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showNewMissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Новая миссия</h2>
              <button
                onClick={() => setShowNewMissionModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Название миссии
                </label>
                <input
                  type="text"
                  value={newMission.title}
                  onChange={(e) =>
                    setNewMission({ ...newMission, title: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  placeholder="Например: Набрать 1000 подписчиков"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Описание
                </label>
                <textarea
                  value={newMission.description}
                  onChange={(e) =>
                    setNewMission({ ...newMission, description: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg h-24"
                  placeholder="Опишите вашу миссию"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Папка
                </label>
                <select
                  value={newMission.folder}
                  onChange={(e) =>
                    setNewMission({ ...newMission, folder: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  <option value="">Выберите папку</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Цель
                  </label>
                  <input
                    type="number"
                    value={newMission.target}
                    onChange={(e) =>
                      setNewMission({
                        ...newMission,
                        target: Number(e.target.value),
                      })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Единица измерения
                  </label>
                  <input
                    type="text"
                    value={newMission.unit}
                    onChange={(e) =>
                      setNewMission({ ...newMission, unit: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    placeholder="подписчиков"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={newMission.startDate}
                    onChange={(e) =>
                      setNewMission({ ...newMission, startDate: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={newMission.endDate}
                    onChange={(e) =>
                      setNewMission({ ...newMission, endDate: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Цвет
                </label>
                <input
                  type="color"
                  value={newMission.color}
                  onChange={(e) =>
                    setNewMission({ ...newMission, color: e.target.value })
                  }
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewMissionModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddMission}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Создать миссию
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Новая папка</h2>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Название папки
                </label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) =>
                    setNewFolder({ ...newFolder, name: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  placeholder="Например: Здоровье"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Цвет
                </label>
                <input
                  type="color"
                  value={newFolder.color}
                  onChange={(e) =>
                    setNewFolder({ ...newFolder, color: e.target.value })
                  }
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddFolder}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Создать папку
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingMission && (
        <EditMissionModal
          mission={editingMission}
          onClose={() => setEditingMission(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </DashboardLayout>
  );
} 