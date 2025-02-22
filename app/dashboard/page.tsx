'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTaskContext, Task } from '../contexts/TaskContext';
import { useMissionContext } from '../contexts/MissionContext';
import { calculateProgressToNextLevel, calculateRequiredXP } from '../utils/levelCalculation';

// Добавляем типизацию для TaskItem
interface TaskItemProps {
  task: Task;
}

export default function Dashboard() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { tasks, toggleTaskCompletion, refreshTasks } = useTaskContext();
  const { missions } = useMissionContext();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Добавляем состояние для отслеживания обновлений
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // Оптимизированная функция обновления данных
  const updateDashboardData = useCallback(async () => {
    const now = Date.now();
    if (now - lastUpdateTime < 5000 || isUpdating) return; // Предотвращаем частые обновления

    setIsUpdating(true);
    try {
      await Promise.all([
        refreshTasks(),
        updateSession()
      ]);
      setLastUpdateTime(now);
    } finally {
      setIsUpdating(false);
    }
  }, [lastUpdateTime, isUpdating, refreshTasks, updateSession]);

  // Обновляем обработчик фокуса
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        updateDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [updateDashboardData]);

  // Получаем задачи на сегодня
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      const today = new Date();
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    });
  }, [tasks]);

  // Получаем статистику по выполненным задачам
  const completedTasks = useMemo(() => 
    todayTasks.filter(task => task.completed),
    [todayTasks]
  );

  const completionRate = useMemo(() => 
    todayTasks.length > 0
      ? Math.round((completedTasks.length / todayTasks.length) * 100)
      : 0,
    [completedTasks.length, todayTasks.length]
  );

  // Подсчитываем заработанный XP за сегодня
  const earnedXPToday = useMemo(() => {
    const completedTasksXP = completedTasks.length; // 1 XP за каждую выполненную задачу
    const bonusXP = completedTasks.length === todayTasks.length && todayTasks.length > 0 ? 3 : 0; // Бонус за выполнение всех задач
    return completedTasksXP + bonusXP;
  }, [completedTasks.length, todayTasks.length]);

  // Кешируем вычисления для XP и уровня
  const { progress, requiredForNext } = useMemo(() => 
    calculateProgressToNextLevel(session?.user?.xp || 0),
    [session?.user?.xp]
  );

  // Создаем локальное состояние для XP и уровня
  const [localXP, setLocalXP] = useState(session?.user?.xp || 0);
  const [localLevel, setLocalLevel] = useState(session?.user?.level || 1);

  // Оптимизируем обработчик выполнения задачи
  const handleTaskCompletion = useCallback(async (taskId: number) => {
    try {
      await toggleTaskCompletion(taskId);
      // Убираем принудительное обновление сессии
    } catch (error) {
      console.error('Dashboard: Error completing task', { taskId, error });
    }
  }, [toggleTaskCompletion]);

  // Оптимизируем эффект инициализации
  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  // Оптимизируем обновление XP и уровня
  useEffect(() => {
    if (session?.user) {
      setLocalXP(session.user.xp);
      setLocalLevel(session.user.level);
    }
  }, [session?.user?.xp, session?.user?.level]); // Зависим только от нужных полей

  // Мемоизируем вычисление прогресса
  const progressData = useMemo(() => ({
    progress: calculateProgressToNextLevel(localXP),
    requiredForNext: calculateRequiredXP(localLevel)
  }), [localXP, localLevel]);

  // Оптимизируем рендеринг TaskItem с помощью React.memo
  const TaskItem = memo(({ task }: TaskItemProps) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
        task.completed ? 'bg-green-500/20' : 'bg-white/5'
      }`}
    >
      <button
        onClick={() => handleTaskCompletion(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-white/30 hover:border-white/50'
        }`}
      >
        {task.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
      </button>
      <span
        className={`flex-1 text-sm transition-all duration-300 ${
          task.completed ? 'text-gray-400 line-through' : 'text-white'
        }`}
      >
        {task.title}
      </span>
      <div
        className={`w-2 h-2 rounded-full ${
          task.priority === 'high'
            ? 'bg-red-500'
            : task.priority === 'medium'
            ? 'bg-yellow-500'
            : 'bg-blue-500'
        }`}
      />
    </div>
  ));

  // Добавляем displayName для мемоизированного компонента
  TaskItem.displayName = 'TaskItem';

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
          <h1 className="text-2xl font-bold text-white mb-6">Дашборд</h1>

          {/* Верхние карточки */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Задачи сегодня</h3>
                <ChartBarIcon className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">{todayTasks.length}</p>
              <p className="text-white/70 text-sm mt-1">
                {completedTasks.length} выполнено ({completionRate}%)
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Уровень</h3>
                <FireIcon className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">{localLevel}</p>
              <p className="text-white/70 text-sm mt-1">
                XP: {progressData.progress.progress} / {progressData.progress.requiredForNext}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Прогресс</h3>
                <TrophyIcon className="w-8 h-8 text-white/50" />
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${(progressData.progress.progress / progressData.progress.requiredForNext) * 100}%`,
                  }}
                />
              </div>
              <p className="text-white/70 text-sm mt-2">
                До следующего уровня: {progressData.progress.requiredForNext - progressData.progress.progress} XP
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Дата</h3>
                <CalendarIcon className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">
                {format(new Date(), 'd MMM', { locale: ru })}
              </p>
              <p className="text-white/70 text-sm mt-1">
                {format(new Date(), 'EEEE', { locale: ru })}
              </p>
            </div>
          </div>

          {/* Секция миссий */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Активные миссии</h2>
              {missions.filter(mission => mission.isOnDashboard).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missions.filter(mission => mission.isOnDashboard).map(mission => (
                    <div key={mission.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">{mission.title}</h3>
                        <span className="text-sm text-gray-400">
                          {mission.progress} / {mission.target} {mission.unit}
                        </span>
                      </div>
                      
                      {mission.description && (
                        <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                      )}

                      <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full transition-all duration-300"
                          style={{
                            width: `${(mission.progress / mission.target) * 100}%`,
                            backgroundColor: mission.color
                          }}
                        />
                      </div>

                      {mission.startDate && mission.endDate && (
                        <div className="mt-2 text-sm text-gray-400">
                          {format(new Date(mission.startDate), 'd MMM', { locale: ru })} - {format(new Date(mission.endDate), 'd MMM yyyy', { locale: ru })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Нет активных миссий на дашборде</p>
                  <p className="text-sm mt-2">Добавьте миссии через раздел "Миссии"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Задачи на сегодня */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Задачи на сегодня</h3>
              <button
                onClick={() => router.push('/tasks')}
                className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              {todayTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {todayTasks.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  На сегодня задач нет
                </p>
              )}
            </div>
          </div>

          {/* График активности */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Статистика</h3>
            
            {/* Статистика по дням */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Последние 7 дней</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  
                  const dayTasks = tasks.filter(task => {
                    if (!task.date) return false;
                    const taskDate = new Date(task.date);
                    return (
                      taskDate.getDate() === date.getDate() &&
                      taskDate.getMonth() === date.getMonth() &&
                      taskDate.getFullYear() === date.getFullYear()
                    );
                  });

                  const completedCount = dayTasks.filter(task => task.completed).length;
                  const totalCount = dayTasks.length;
                  const isToday = date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth() &&
                                date.getFullYear() === new Date().getFullYear();

                  let barColor = 'bg-gray-600'; // По умолчанию серый
                  if (totalCount > 0) {
                    if (completedCount === totalCount) {
                      barColor = 'bg-green-500'; // Если все задачи выполнены (включая сегодняшний день)
                    } else {
                      barColor = 'bg-red-500'; // Если есть невыполненные задачи
                    }
                  } else if (isToday) {
                    barColor = 'bg-gray-600'; // Если сегодня нет задач
                  }

                  const height = totalCount > 0 ? Math.max((completedCount / totalCount) * 100, 20) : 20;

                  return (
                    <div key={date.toISOString()} className="flex flex-col items-center">
                      <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${barColor}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {format(date, 'EEE', { locale: ru })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {completedCount}/{totalCount}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-400">Все выполнено</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-400">Есть невыполненные</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-600 rounded-full" />
                  <span className="text-gray-400">Сегодня</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Выполнено задач сегодня</span>
                  <span className="text-green-400">{completedTasks.length}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Заработано XP сегодня</span>
                  <span className="text-yellow-400">+{earnedXPToday} XP</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Всего задач</span>
                  <span className="text-blue-400">{tasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 