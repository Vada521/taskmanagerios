'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  PlusIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { useTaskContext } from '../contexts/TaskContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Projects() {
  const {
    projects,
    tasks,
    addProject,
    updateProject,
    deleteProject,
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskExpansion,
    toggleTaskEdit,
  } = useTaskContext();

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#4F46E5',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    project: '',
    repeat: 'never' as 'never' | 'daily' | 'weekly' | 'monthly',
    date: new Date(),
  });

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      addProject(newProject);
      setNewProject({ name: '', description: '', color: '#4F46E5' });
      setShowNewProjectModal(false);
    }
  };

  const handleAddTask = () => {
    if (newTask.title && selectedProject) {
      addTask({
        ...newTask,
        project: selectedProject,
        completed: false,
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        project: '',
        repeat: 'never',
        date: new Date(),
      });
      setShowNewTaskModal(false);
    }
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((task) => task.project === projectId);
  };

  const getCompletedTasksCount = (projectId: string) => {
    return getProjectTasks(projectId).filter((task) => task.completed).length;
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    return (getCompletedTasksCount(projectId) / projectTasks.length) * 100;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Кнопка создания нового проекта */}
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-6 flex items-center justify-center gap-3 text-center cursor-pointer hover:bg-gray-750 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Создать новый проект</h3>
              <p className="text-gray-400 text-sm mt-1">
                Организуйте свои задачи по проектам
              </p>
            </div>
          </button>

          {/* Список проектов */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedProject(
                    expandedProject === project.id ? null : project.id
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: project.color }}
                    >
                      <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                    {editingProject === project.id ? (
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) =>
                          updateProject(project.id, { name: e.target.value })
                        }
                        className="bg-gray-700 text-white px-3 py-1 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <h3 className="text-white font-medium">{project.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {project.description}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {getProjectTasks(project.id).length} задач
                      </div>
                      <div className="text-white text-sm">
                        {getCompletedTasksCount(project.id)} выполнено
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(
                          editingProject === project.id ? null : project.id
                        );
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {expandedProject === project.id ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Прогресс</span>
                    <span className="text-white">
                      {Math.round(getProjectProgress(project.id))}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${getProjectProgress(project.id)}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Список задач проекта */}
              {expandedProject === project.id && (
                <div className="border-t border-gray-700">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-medium">Задачи проекта</h4>
                      <button
                        onClick={() => {
                          setSelectedProject(project.id);
                          setShowNewTaskModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Добавить задачу</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {getProjectTasks(project.id).length > 0 ? (
                        getProjectTasks(project.id).map((task) => (
                          <div
                            key={task.id}
                            className={`bg-gray-700/50 rounded-lg transition-all ${
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
                                {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
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
                                  onClick={(e) => e.stopPropagation()}
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
                                  className={`w-5 h-5 ${
                                    task.priority === 'high'
                                      ? 'text-red-500'
                                      : task.priority === 'medium'
                                      ? 'text-yellow-500'
                                      : 'text-blue-500'
                                  }`}
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
                                      onClick={(e) => e.stopPropagation()}
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
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
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
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <option value="low">Низкий приоритет</option>
                                          <option value="medium">Средний приоритет</option>
                                          <option value="high">Высокий приоритет</option>
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
                                          onClick={(e) => e.stopPropagation()}
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskEdit(task.id);
                                        }}
                                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                      >
                                        Отмена
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskEdit(task.id);
                                        }}
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
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskEdit(task.id);
                                        }}
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
                        <p className="text-gray-400 text-center py-4">
                          В этом проекте пока нет задач
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно создания проекта */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              Создание нового проекта
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Название проекта
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                  placeholder="Введите название проекта"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Описание
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg h-24"
                  placeholder="Добавьте описание проекта"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Цвет проекта
                </label>
                <input
                  type="color"
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddProject}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Создать проект
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания задачи */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">
              Новая задача в проекте
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
                <label className="block text-gray-400 text-sm mb-2">Дата</label>
                <input
                  type="date"
                  value={format(newTask.date, 'yyyy-MM-dd')}
                  onChange={(e) => setNewTask({ ...newTask, date: new Date(e.target.value) })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                />
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
                  Создать задачу
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 