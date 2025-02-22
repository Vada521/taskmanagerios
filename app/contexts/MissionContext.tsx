'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Mission {
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
  progressHistory?: {
    date: Date;
    progress: number;
  }[];
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface MissionContextType {
  missions: Mission[];
  folders: { id: string; name: string; color: string }[];
  addMission: (mission: Omit<Mission, 'id' | 'progressHistory' | 'status' | 'progress' | 'isOnDashboard'>) => void;
  updateMission: (missionId: string, updates: Partial<Mission>) => void;
  deleteMission: (missionId: string) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  addFolder: (folder: { name: string; color: string }) => void;
  deleteFolder: (folderId: string) => void;
  toggleMissionOnDashboard: (missionId: string) => void;
  archiveMission: (missionId: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [folders, setFolders] = useState([
    { id: 'life', name: 'Жизнь', color: '#10B981' },
    { id: 'social', name: 'Социальные сети', color: '#E1306C' },
    { id: 'work', name: 'Работа', color: '#4F46E5' }
  ]);
  const { data: session } = useSession();
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchMissions = async () => {
    // Предотвращаем слишком частые запросы
    const now = Date.now();
    if (now - lastFetchTime < 5000) { // Минимальный интервал 5 секунд
      return;
    }

    try {
      const response = await fetch('/api/missions');
      if (response.ok) {
        const data = await response.json();
        setMissions(data.map((mission: any) => ({
          ...mission,
          startDate: mission.startDate ? new Date(mission.startDate) : undefined,
          endDate: mission.endDate ? new Date(mission.endDate) : undefined,
          progressHistory: mission.progressHistory ? mission.progressHistory.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          })) : []
        })));
        setLastFetchTime(now);
      }
    } catch (error) {
      console.error('Ошибка при загрузке миссий:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchMissions();
    }
  }, [session?.user?.id]);

  const addMission = async (mission: Omit<Mission, 'id' | 'progressHistory' | 'status' | 'progress' | 'isOnDashboard'>) => {
    try {
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mission,
          startDate: mission.startDate?.toISOString(),
          endDate: mission.endDate?.toISOString(),
        }),
      });

      if (response.ok) {
        const newMission = await response.json();
        setMissions(prev => [...prev, {
          ...newMission,
          startDate: newMission.startDate ? new Date(newMission.startDate) : undefined,
          endDate: newMission.endDate ? new Date(newMission.endDate) : undefined,
          progressHistory: newMission.progressHistory ? newMission.progressHistory.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          })) : []
        }]);
      } else {
        console.error('Ошибка при создании миссии:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка при создании миссии:', error);
    }
  };

  const updateMission = async (missionId: string, updates: Partial<Mission>) => {
    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          startDate: updates.startDate?.toISOString(),
          endDate: updates.endDate?.toISOString(),
        }),
      });

      if (response.ok) {
        const updatedMission = await response.json();
        setMissions(prev => prev.map(mission =>
          mission.id === missionId ? {
            ...mission,
            ...updatedMission.mission,
            startDate: updatedMission.mission.startDate ? new Date(updatedMission.mission.startDate) : undefined,
            endDate: updatedMission.mission.endDate ? new Date(updatedMission.mission.endDate) : undefined,
            progressHistory: updatedMission.mission.progressHistory ? updatedMission.mission.progressHistory.map((entry: any) => ({
              ...entry,
              date: new Date(entry.date)
            })) : []
          } : mission
        ));
      } else {
        console.error('Ошибка при обновлении миссии:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка при обновлении миссии:', error);
    }
  };

  const deleteMission = async (missionId: string) => {
    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMissions(prev => prev.filter(mission => mission.id !== missionId));
      } else {
        console.error('Ошибка при удалении миссии:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка при удалении миссии:', error);
    }
  };

  const updateMissionProgress = async (missionId: string, progress: number) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const newProgressHistory = [
      ...(mission.progressHistory || []),
      { date: new Date(), value: progress }
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const newStatus = progress >= mission.target
      ? 'completed'
      : progress > 0
        ? 'in_progress'
        : 'backlog';

    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress,
          status: newStatus,
          progressHistory: newProgressHistory,
        }),
      });

      if (response.ok) {
        const updatedMission = await response.json();
        setMissions(prev => prev.map(m =>
          m.id === missionId ? {
            ...m,
            ...updatedMission.mission,
            startDate: updatedMission.mission.startDate ? new Date(updatedMission.mission.startDate) : undefined,
            endDate: updatedMission.mission.endDate ? new Date(updatedMission.mission.endDate) : undefined,
            progressHistory: (updatedMission.mission.progressHistory || []).map((entry: any) => ({
              ...entry,
              date: new Date(entry.date)
            }))
          } : m
        ));
      } else {
        console.error('Ошибка при обновлении прогресса:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error);
    }
  };

  const addFolder = (folder: { name: string; color: string }) => {
    const newFolder = {
      ...folder,
      id: folder.name.toLowerCase().replace(/\s+/g, '_')
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    // Удаляем все миссии из этой папки
    missions.forEach(mission => {
      if (mission.folder === folderId) {
        deleteMission(mission.id);
      }
    });
  };

  const toggleMissionOnDashboard = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    await updateMission(missionId, {
      isOnDashboard: !mission.isOnDashboard
    });
  };

  const archiveMission = async (missionId: string) => {
    try {
      const response = await fetch(`/api/missions/${missionId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { mission: updatedMission } = await response.json();
        setMissions(prevMissions =>
          prevMissions.map(mission =>
            mission.id === missionId
              ? {
                  ...mission,
                  ...updatedMission,
                  startDate: updatedMission.startDate ? new Date(updatedMission.startDate) : undefined,
                  endDate: updatedMission.endDate ? new Date(updatedMission.endDate) : undefined,
                  progressHistory: (updatedMission.progressHistory || []).map((entry: any) => ({
                    ...entry,
                    date: new Date(entry.date)
                  }))
                }
              : mission
          )
        );
      } else {
        console.error('Ошибка при архивации миссии:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка при архивации миссии:', error);
    }
  };

  return (
    <MissionContext.Provider
      value={{
        missions,
        folders,
        addMission,
        updateMission,
        deleteMission,
        updateMissionProgress,
        addFolder,
        deleteFolder,
        toggleMissionOnDashboard,
        archiveMission,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMissionContext() {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error('useMissionContext must be used within a MissionProvider');
  }
  return context;
} 