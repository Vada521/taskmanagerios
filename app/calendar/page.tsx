'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FlagIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useTaskContext } from '../contexts/TaskContext';
import type { Task } from '../contexts/TaskContext';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableTaskProps {
  task: Task;
  className?: string;
}

function DraggableTask({ task, className = '' }: DraggableTaskProps) {
  const { toggleTaskCompletion } = useTaskContext();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task
    }
  });

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    touchAction: 'none',
    userSelect: 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-800 rounded-lg p-2 mb-2 select-none hover:bg-gray-700/50 transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleTaskCompletion(task.id);
          }}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-400'
          }`}
        >
          {task.completed && (
            <svg
              className="w-3 h-3 text-white"
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
        <div className={`text-white ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </div>
      </div>
      <div className={`text-sm ${getPriorityColor(task.priority)} ml-7`}>
        {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
      </div>
    </div>
  );
}

interface DroppableDayProps {
  date: Date;
  children: React.ReactNode;
}

const DroppableDay = ({ date, children }: DroppableDayProps) => {
  const { setNodeRef } = useDroppable({
    id: date.toISOString(),
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 space-y-2 rounded-lg transition-colors min-h-[60px]"
    >
      {children}
    </div>
  );
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    project: '',
    repeat: 'never' as 'never' | 'daily' | 'weekly' | 'monthly',
  });
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const {
    tasks,
    projects,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    updateTask,
    toggleTaskExpansion,
    toggleTaskEdit,
  } = useTaskContext();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    })
  );

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => task.date && isSameDay(new Date(task.date), date));
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

  const isDraggingOver = (date: Date) => {
    return draggedTask && selectedDate && isSameDay(date, selectedDate);
  };

  const handleAddTask = () => {
    if (newTask.title && selectedDate) {
      addTask({
        ...newTask,
        date: selectedDate,
        completed: false,
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        project: '',
        repeat: 'never' as 'never' | 'daily' | 'weekly' | 'monthly',
      });
      setShowNewTaskModal(false);
    } else if (!selectedDate) {
      alert('Пожалуйста, выберите дату в календаре');
    } else {
      alert('Пожалуйста, введите название задачи');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('Started dragging task:', active.data.current?.task);
    setDraggedTask(active.data.current?.task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active.data.current?.task) {
      console.log('No valid drop target or dragged task');
      setDraggedTask(null);
      return;
    }

    const task = active.data.current.task;
    const dropDate = new Date(over.id);

    if (!isNaN(dropDate.getTime())) {
      const updatedTask = {
        ...task,
        date: dropDate
      };
      updateTask(task.id, updatedTask);
    }
    
    setDraggedTask(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Календарь</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                </button>
                <span className="text-lg text-white">
                  {format(currentDate, 'LLLL yyyy', { locale: ru })}
                </span>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Новая задача</span>
            </button>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-7 gap-4">
              {daysInMonth.map((date) => {
                const isToday = isSameDay(date, new Date());
                const tasks = getTasksForDate(date);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[120px] p-4 rounded-xl border-2 transition-all hover:bg-gray-700/30 hover:border-purple-500/50 ${
                      isToday ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-800/50 border-gray-700'
                    } ${isDraggingOver(date) ? 'border-purple-500 border-dashed bg-purple-900/30' : ''} ${
                      selectedDate && isSameDay(date, selectedDate) ? 'ring-2 ring-purple-500 bg-purple-900/20' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="h-full flex flex-col">
                      <div className={`text-sm mb-2 transition-colors ${
                        selectedDate && isSameDay(date, selectedDate) ? 'text-purple-300' : 'text-gray-400'
                      }`}>
                        {format(date, 'd MMMM', { locale: ru })}
                      </div>
                      <DroppableDay date={date}>
                        {tasks.map((task) => (
                          <DraggableTask key={task.id} task={task} />
                        ))}
                      </DroppableDay>
                    </div>
                  </div>
                );
              })}
            </div>
            <DragOverlay>
              {draggedTask && (
                <DraggableTask 
                  task={draggedTask} 
                  className="opacity-80 scale-105 shadow-xl cursor-grabbing" 
                />
              )}
            </DragOverlay>
          </DndContext>

          {/* Детали выбранного дня */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">
                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </h3>
              <div className="space-y-4">
                {getTasksForDate(selectedDate).length > 0 ? (
                  getTasksForDate(selectedDate).map((task) => (
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
                                task.completed ? 'text-gray-400 line-through' : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.date && (
                              <span className="block text-sm text-gray-400 mt-1">
                                {format(new Date(task.date), 'd MMMM yyyy', {
                                  locale: ru,
                                })}
                                {task.repeat && task.repeat !== 'never' && (
                                  <span className="ml-2 text-purple-400">
                                    ({task.repeat === 'daily' && 'Каждый день'}
                                    {task.repeat === 'weekly' && 'Каждую неделю'}
                                    {task.repeat === 'monthly' && 'Каждый месяц'})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <FlagIcon
                            className={`w-5 h-5 ${getPriorityColor(task.priority).replace('bg-', 'text-')}`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
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
                                  <label className="block text-gray-400 text-sm mb-2">Приоритет</label>
                                  <select
                                    value={task.priority}
                                    onChange={(e) =>
                                      updateTask(task.id, {
                                        ...task,
                                        priority: e.target.value as 'low' | 'medium' | 'high',
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
                                    value={task.repeat}
                                    onChange={(e) =>
                                      updateTask(task.id, {
                                        ...task,
                                        repeat: e.target.value as 'never' | 'daily' | 'weekly' | 'monthly',
                                      })
                                    }
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                                  >
                                    <option value="never">Без повторения</option>
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
                                  onClick={() => toggleTaskEdit(task.id)}
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
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-2">
                    Нет задач на этот день
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Модальное окно создания задачи */}
          {showNewTaskModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-white mb-4">
                  Новая задача на {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'выбранную дату'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Название задачи</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Название задачи"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Описание</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Описание задачи"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Выбранная дата</label>
                    <div className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg">
                      {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату в календаре'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Приоритет</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
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
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
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
                      onChange={(e) => setNewTask({ ...newTask, repeat: e.target.value as 'never' | 'daily' | 'weekly' | 'monthly' })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <option value="never">Без повторения</option>
                      <option value="daily">Каждый день</option>
                      <option value="weekly">Каждую неделю</option>
                      <option value="monthly">Каждый месяц</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowNewTaskModal(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleAddTask}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Создать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 