'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  CalendarIcon,
  StarIcon,
  FlagIcon,
  TrashIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, isYesterday, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTaskContext } from '../contexts/TaskContext';

interface Task {
  id: number;
  title: string;
  description?: string;
  date?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  project?: string;
  expanded: boolean;
  isEditing: boolean;
  repeat?: 'daily' | 'weekly' | 'monthly';
  isOverdue: boolean;
}

type DateFilter = 'all' | 'today' | 'upcoming' | 'past' | 'archived';

interface NewTask {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  project?: string;
  repeat?: 'daily' | 'weekly' | 'monthly';
  date?: Date;
}

export default function Tasks() {
  const {
    tasks,
    archivedTasks,
    projects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    toggleTaskExpansion,
    toggleTaskEdit,
    getArchivedTasks,
  } = useTaskContext();

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    priority: 'medium',
    project: '',
    repeat: undefined,
    date: undefined
  });

  // Группировка задач по датам и фильтрация
  const groupedTasks = useMemo(() => {
    const filteredTasks = dateFilter === 'archived' ? archivedTasks : tasks.filter(task => {
      if (dateFilter === 'all') return true;
      if (!task.date) return false;
      
      switch (dateFilter) {
        case 'today':
          return isToday(new Date(task.date));
        case 'upcoming':
          return new Date(task.date) > new Date() && !isToday(new Date(task.date));
        case 'past':
          return new Date(task.date) < new Date() && !isToday(new Date(task.date));
        default:
          return true;
      }
    });

    const groups = filteredTasks.reduce((acc, task) => {
      if (!task.date) {
        const noDateKey = 'no-date';
        if (!acc[noDateKey]) {
          acc[noDateKey] = [];
        }
        acc[noDateKey].push(task);
        return acc;
      }
      
      const dateStr = format(new Date(task.date), 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Сортировка дат
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'no-date') return 1; // Задачи без даты в конце
        if (dateB === 'no-date') return -1;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })
      .map(([date, tasks]) => ({
        date: date === 'no-date' ? null : new Date(date),
        tasks: tasks.sort((a, b) => {
          // Сортировка задач: сначала незавершенные, потом по приоритету
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }),
      }));
  }, [tasks, dateFilter]);

  const addNewTask = () => {
    if (newTask.title) {
      addTask({
        ...newTask,
        priority: newTask.priority || 'medium',
        completed: false,
        archived: false,
        expanded: false,
        isEditing: false,
        isOverdue: false,
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        project: '',
        repeat: undefined,
        date: undefined
      });
      setShowNewTaskForm(false);
    }
  };

  const saveTaskChanges = (taskId: number) => {
    toggleTaskEdit(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getDateHeading = (date: Date) => {
    if (isToday(date)) return 'Сегодня';
    if (isYesterday(date)) return 'Вчера';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'd MMMM yyyy', { locale: ru });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Задачи</h2>
              <div className="flex bg-gray-700 rounded-lg">
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter === 'today'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Сегодня
                </button>
                <button
                  onClick={() => setDateFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter === 'upcoming'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Предстоящие
                </button>
                <button
                  onClick={() => setDateFilter('past')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter === 'past'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Прошедшие
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Все
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Новая задача</span>
            </button>
          </div>

          {/* Форма создания новой задачи */}
          {showNewTaskForm && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Название задачи"
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg mb-4"
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Описание задачи"
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg mb-4 h-24"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Дата</label>
                  <input
                    type="date"
                    value={newTask.date ? format(new Date(newTask.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setNewTask({ ...newTask, date: new Date(e.target.value) })}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Приоритет</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    <option value="low">Низкий приоритет</option>
                    <option value="medium">Средний приоритет</option>
                    <option value="high">Высокий приоритет</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Проект</label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    <option value="">Без проекта</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Повторение</label>
                  <select
                    value={newTask.repeat}
                    onChange={(e) => setNewTask({ ...newTask, repeat: e.target.value as Task['repeat'] })}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    <option value="never">Без повторения</option>
                    <option value="daily">Каждый день</option>
                    <option value="weekly">Каждую неделю</option>
                    <option value="monthly">Каждый месяц</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={addNewTask}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Создать
                </button>
              </div>
            </div>
          )}

          {/* Список задач по датам */}
          <div className="space-y-8">
            {groupedTasks.map(({ date, tasks }) => (
              <div key={date ? date.toISOString() : 'no-date'} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {date ? getDateHeading(date) : 'Без даты'}
                  <span className="text-sm">({tasks.length})</span>
                </h3>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-gray-700 rounded-lg transition-all ${
                        task.expanded ? 'p-6' : 'p-4'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => !task.isEditing && toggleTaskExpansion(task.id)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskExpansion(task.id);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {task.expanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-400'
                          }`}
                        >
                          {task.completed && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        
                        {task.isEditing ? (
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                              updateTask(task.id, { ...task, title: e.target.value })
                            }
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex-1"
                            onDoubleClick={() => toggleTaskEdit(task.id)}
                          >
                            <span
                              className={`block text-lg ${
                                task.completed ? 'text-gray-400 line-through' : task.isOverdue ? 'text-red-400' : 'text-white'
                              }`}
                            >
                              {task.title}
                              {task.isOverdue && !task.completed && (
                                <span className="ml-2 text-xs text-red-400">(Просрочена)</span>
                              )}
                            </span>
                            {task.date && (
                              <span className="block text-sm text-gray-400 mt-1">
                                {format(new Date(task.date), 'd MMMM yyyy', {
                                  locale: ru,
                                })}
                                {task.repeat && (
                                  <span className="ml-2 text-purple-400">
                                    {task.repeat === 'daily' && '(Каждый день)'}
                                    {task.repeat === 'weekly' && '(Каждую неделю)'}
                                    {task.repeat === 'monthly' && '(Каждый месяц)'}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <FlagIcon
                            className={`w-5 h-5 ${getPriorityColor(task.priority)}`}
                          />
                          {task.project && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: projects.find((p) => p.id === task.project)?.color || '#4F46E5'
                                }}
                              />
                              <span>{projects.find((p) => p.id === task.project)?.name || 'Проект удален'}</span>
                            </div>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Развернутая информация о задаче */}
                      {task.expanded && (
                        <div className="mt-4 space-y-4">
                          {task.isEditing ? (
                            <>
                              <textarea
                                value={task.description}
                                onChange={(e) =>
                                  updateTask(task.id, { ...task, description: e.target.value })
                                }
                                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg h-24"
                                placeholder="Описание задачи"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-gray-400 text-sm mb-2">Дата</label>
                                  <input
                                    type="date"
                                    value={
                                      task.date
                                        ? format(new Date(task.date), 'yyyy-MM-dd')
                                        : ''
                                    }
                                    onChange={(e) =>
                                      updateTask(task.id, { ...task, date: new Date(e.target.value) })
                                    }
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-sm mb-2">Приоритет</label>
                                  <select
                                    value={task.priority}
                                    onChange={(e) =>
                                      updateTask(task.id, {
                                        ...task,
                                        priority: e.target.value as
                                          | 'low'
                                          | 'medium'
                                          | 'high',
                                      })
                                    }
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                                  >
                                    <option value="low">Низкий приоритет</option>
                                    <option value="medium">Средний приоритет</option>
                                    <option value="high">Высокий приоритет</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-sm mb-2">Проект</label>
                                  <select
                                    value={task.project}
                                    onChange={(e) =>
                                      updateTask(task.id, { ...task, project: e.target.value })
                                    }
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                                  >
                                    <option value="">Без проекта</option>
                                    {projects.map((project) => (
                                      <option key={project.id} value={project.id}>
                                        {project.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-gray-400 text-sm mb-2">Повторение</label>
                                  <select
                                    value={task.repeat || ''}
                                    onChange={(e) =>
                                      updateTask(task.id, {
                                        ...task,
                                        repeat: e.target.value ? e.target.value as 'daily' | 'weekly' | 'monthly' : undefined,
                                      })
                                    }
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                                  >
                                    <option value="">Без повторения</option>
                                    <option value="daily">Каждый день</option>
                                    <option value="weekly">Каждую неделю</option>
                                    <option value="monthly">Каждый месяц</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <button
                                  onClick={() => toggleTaskEdit(task.id)}
                                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                  Отмена
                                </button>
                                <button
                                  onClick={() => saveTaskChanges(task.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                  Сохранить
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-300">{task.description}</p>
                              <div className="flex items-center gap-6 text-sm flex-wrap">
                                {task.date && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <CalendarIcon className="w-5 h-5" />
                                    <span>
                                      {format(new Date(task.date), 'd MMMM yyyy', {
                                        locale: ru,
                                      })}
                                      {task.repeat && (
                                        <span className="ml-2 text-purple-400">
                                          {task.repeat === 'daily' && '(Каждый день)'}
                                          {task.repeat === 'weekly' && '(Каждую неделю)'}
                                          {task.repeat === 'monthly' && '(Каждый месяц)'}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {task.project && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: projects.find((p) => p.id === task.project)?.color || '#4F46E5'
                                      }}
                                    />
                                    <span>{projects.find((p) => p.id === task.project)?.name || 'Проект удален'}</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => toggleTaskEdit(task.id)}
                                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                  <span>Редактировать</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {groupedTasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Нет задач для отображения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 