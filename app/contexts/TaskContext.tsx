'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import debounce from 'lodash/debounce';
import { API_ENDPOINTS } from '../constants/api';
import { usePathname } from 'next/navigation';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  project?: string;
  repeat?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  archived: boolean;
  archivedAt?: Date;
  date?: Date;
  expanded: boolean;
  isEditing: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  rewards?: {
    xpChange: number;
    goldChange: number;
    newLevel: number | null;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface TaskContextType {
  tasks: Task[];
  archivedTasks: Task[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  getArchivedTasks: () => Promise<void>;
  addTask: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: number, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompletion: (id: number) => Promise<void>;
  toggleTaskExpansion: (taskId: number) => void;
  toggleTaskEdit: (taskId: number) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Работа', color: '#4F46E5', description: 'Рабочие задачи' },
    { id: '2', name: 'Личное', color: '#10B981', description: 'Личные дела' },
    { id: '3', name: 'Учёба', color: '#F59E0B', description: 'Обучение и развитие' },
    { id: '4', name: 'Здоровье', color: '#EF4444', description: 'Здоровье и спорт' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [updateQueue, setUpdateQueue] = useState<number[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Кеширование задач по ID для быстрого доступа
  const tasksById = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<number, Task>);
  }, [tasks]);

  // Оптимизированная функция обновления задач
  const processUpdateQueue = useCallback(async () => {
    if (isProcessingQueue || updateQueue.length === 0) return;
    
    setIsProcessingQueue(true);
    try {
      const taskId = updateQueue[0];
      const task = tasksById[taskId];
      if (!task) return;

      const response = await fetch(API_ENDPOINTS.TASKS.COMPLETE(taskId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении задачи');
      }

      const { task: updatedTask, rewards } = await response.json();
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, ...updatedTask, rewards }
          : t
      ));

      setUpdateQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('Ошибка при обработке очереди обновлений:', error);
    } finally {
      setIsProcessingQueue(false);
    }
  }, [updateQueue, isProcessingQueue, tasksById]);

  // Используем useEffect для обработки очереди
  useEffect(() => {
    if (updateQueue.length > 0) {
      processUpdateQueue();
    }
  }, [updateQueue, processUpdateQueue]);

  const toggleTaskCompletion = useCallback(async (id: number) => {
    const task = tasksById[id];
    if (!task) return;

    // Оптимистичное обновление UI
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, completed: !t.completed }
        : t
    ));

    // Добавляем задачу в очередь обновлений
    setUpdateQueue(prev => [...prev, id]);
  }, [tasksById]);

  // Оптимизируем debouncedRefresh
  const debouncedRefresh = useCallback(
    debounce(async () => {
      if (!session?.user?.id || isProcessingQueue) return;
      
      const now = Date.now();
      if (now - lastRefresh < 5000) return;

      try {
        const response = await fetch(API_ENDPOINTS.TASKS.BASE);
        if (!response.ok) throw new Error('Ошибка при загрузке задач');
        
        const data = await response.json();
        setTasks(data.map((task: Task) => ({ ...task, isEditing: false, expanded: false })));
        setLastRefresh(now);
      } catch (err) {
        console.error('Ошибка при обновлении задач:', err);
      }
    }, 1000),
    [session?.user?.id, lastRefresh, isProcessingQueue]
  );

  const refreshTasks = useCallback(async () => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  // Оптимистичное обновление UI при изменении задачи
  const optimisticUpdate = useCallback((taskId: number, updates: Partial<Task>) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      // Проверяем, действительно ли есть изменения
      return JSON.stringify(newTasks) !== JSON.stringify(prevTasks) ? newTasks : prevTasks;
    });
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!session?.user?.id) throw new Error('Пользователь не авторизован');

    try {
      const response = await fetch(API_ENDPOINTS.TASKS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          userId: session.user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании задачи');
      }
      
      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании задачи');
      throw err;
    }
  }, [session?.user?.id]);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    if (!session?.user?.id) throw new Error('Пользователь не авторизован');

    const currentTask = tasksById[id];
    if (!currentTask) throw new Error('Задача не найдена');

    // Оптимистичное обновление
    const updatedTask = { ...currentTask, ...updates };
    optimisticUpdate(id, updates);

    try {
      const response = await fetch(API_ENDPOINTS.TASKS.BY_ID(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении задачи');
      }
      
      const responseData = await response.json();
      setTasks(prev => prev.map(task => task.id === id ? responseData : task));
      return responseData;
    } catch (err) {
      // Откатываем изменения при ошибке
      setTasks(prev => prev.map(task => task.id === id ? currentTask : task));
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении задачи');
      throw err;
    }
  }, [session?.user?.id, tasksById, optimisticUpdate]);

  const deleteTask = useCallback(async (id: number) => {
    if (!session?.user?.id) throw new Error('Пользователь не авторизован');

    const currentTask = tasksById[id];
    if (!currentTask) throw new Error('Задача не найдена');

    // Оптимистичное удаление
    setTasks(prev => prev.filter(task => task.id !== id));

    try {
      const response = await fetch(API_ENDPOINTS.TASKS.BY_ID(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении задачи');
      }
    } catch (err) {
      // Откатываем изменения при ошибке
      setTasks(prev => [...prev, currentTask]);
      setError(err instanceof Error ? err.message : 'Ошибка при удалении задачи');
      throw err;
    }
  }, [session?.user?.id, tasksById]);

  // Инициализация при монтировании и изменении сессии
  useEffect(() => {
    if (session?.user?.id) {
      refreshTasks();
    }
  }, [session?.user?.id, refreshTasks]);

  // Сброс состояния expanded при изменении маршрута
  useEffect(() => {
    setTasks(prevTasks =>
      prevTasks.map(task => ({ ...task, expanded: false }))
    );
  }, [pathname]);

  const toggleTaskExpansion = useCallback((taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  }, []);

  const toggleTaskEdit = useCallback((taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isEditing: !task.isEditing } : task
      )
    );
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prevProjects =>
      prevProjects.filter(project => project.id !== projectId)
    );
  }, []);

  const getArchivedTasks = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/tasks/archived');
      if (!response.ok) throw new Error('Ошибка при загрузке архивных задач');
      
      const data = await response.json();
      setArchivedTasks(data);
    } catch (err) {
      console.error('Ошибка при загрузке архивных задач:', err);
    }
  }, [session?.user?.id]);

  const value = useMemo(() => ({
    tasks,
    archivedTasks,
    projects,
    loading,
    error,
    refreshTasks,
    getArchivedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskExpansion,
    toggleTaskEdit,
    addProject,
    updateProject,
    deleteProject,
  }), [
    tasks,
    archivedTasks,
    projects,
    loading,
    error,
    refreshTasks,
    getArchivedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskExpansion,
    toggleTaskEdit,
    addProject,
    updateProject,
    deleteProject,
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 