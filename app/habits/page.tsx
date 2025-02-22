'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useHabits } from '../contexts/HabitContext';
import { 
  PlusIcon, 
  TrashIcon, 
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';

export default function HabitsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newHabitName, setNewHabitName] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  
  const {
    habits,
    isLoading,
    error,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitStats
  } = useHabits();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const stats = getHabitStats();

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await addHabit(newHabitName);
      setNewHabitName('');
      setIsAddingHabit(false);
    } catch (error) {
      console.error('Ошибка при добавлении привычки:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const content = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-white mt-4 text-lg">Загрузка...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-900 p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500">Ошибка: {error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Привычки</h1>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Добавить привычку
          </button>
        </div>

        {isAddingHabit && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAddHabit}
            className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Название привычки"
                className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Добавить
              </button>
              <button
                type="button"
                onClick={() => setIsAddingHabit(false)}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </motion.form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl font-semibold text-white">
                  {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                  <div key={day} className="text-center font-medium text-gray-400 text-sm py-2">
                    {day}
                  </div>
                ))}
                {days.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        p-2 rounded-lg transition-all relative
                        ${isSelected
                          ? 'bg-purple-600 text-white'
                          : isCurrentMonth
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600'}
                        ${isCurrentDay && !isSelected ? 'ring-2 ring-purple-500' : ''}
                      `}
                    >
                      <span className="relative z-10">{format(day, 'd')}</span>
                      {habits.some(habit => 
                        habit.completedDates.includes(format(day, 'yyyy-MM-dd'))
                      ) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Привычки на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </h2>
              <div className="space-y-4">
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                          ${habit.completedDates.includes(format(selectedDate, 'yyyy-MM-dd'))
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-gray-400 hover:bg-gray-500'}
                        `}
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <div>
                        <h3 className="font-medium text-white">{habit.name}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <FireIcon className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-400">
                            Серия: {habit.streak} дней
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
                {habits.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">У вас пока нет привычек</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Добавьте новую привычку, чтобы начать отслеживать свой прогресс
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-purple-500" />
                Статистика
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-gray-300">Лучшая привычка</h3>
                  </div>
                  <p className="font-medium text-white">{stats.bestHabit || 'Нет данных'}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    <h3 className="text-gray-300">Текущие серии</h3>
                  </div>
                  <div className="space-y-2">
                    {habits.map(habit => (
                      <div key={habit.id} className="flex justify-between items-center">
                        <span className="text-gray-400">{habit.name}</span>
                        <span className="text-white font-medium">{habit.streak} дней</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-gray-300">Среднее выполнение</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">
                      {stats.averageCompletion}%
                    </span>
                    <span className="text-gray-400 text-sm mb-1">за все время</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <DashboardLayout>{content()}</DashboardLayout>;
} 