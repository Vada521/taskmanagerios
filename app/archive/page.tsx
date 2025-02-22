'use client';

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import DashboardLayout from '../components/DashboardLayout';
import { useTaskContext, Task } from '../contexts/TaskContext';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

export default function Archive() {
  const { archivedTasks, getArchivedTasks } = useTaskContext();

  useEffect(() => {
    getArchivedTasks();
  }, [getArchivedTasks]);

  // Группируем задачи по дате архивации
  const groupedTasks = useMemo(() => {
    if (!archivedTasks || archivedTasks.length === 0) return [];
    
    const groups = new Map<string, { date: Date; tasks: Task[] }>();
    
    archivedTasks.forEach((task: Task) => {
      const date = task.archivedAt ? new Date(task.archivedAt) : new Date();
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date,
          tasks: []
        });
      }
      
      groups.get(dateKey)?.tasks.push(task);
    });

    return Array.from(groups.entries())
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [archivedTasks]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <ArchiveBoxIcon className="w-8 h-8 text-gray-400" />
            <h1 className="text-2xl font-bold text-white">Архив задач</h1>
          </div>

          {groupedTasks.length > 0 ? (
            <div className="space-y-8">
              {groupedTasks.map(([dateKey, { date, tasks }]) => (
                <div key={dateKey} className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">
                    {format(date, 'd MMMM yyyy', { locale: ru })}
                  </h2>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                task.priority === 'high'
                                  ? 'bg-red-500'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span className="text-gray-200">{task.title}</span>
                          </div>
                          {task.project && (
                            <span className="text-sm text-gray-400">
                              {task.project}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-2 text-sm text-gray-400">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">В архиве пока нет задач</p>
              <p className="text-sm text-gray-500 mt-2">
                Выполненные задачи будут автоматически перемещаться сюда на следующий день
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 