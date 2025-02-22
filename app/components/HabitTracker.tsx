'use client';

import { useState } from 'react';
import { FireIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Habit {
  id: number;
  name: string;
  streak: number;
  completedDates: string[];
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now(),
          name: newHabit,
          streak: 0,
          completedDates: [],
        },
      ]);
      setNewHabit('');
    }
  };

  const toggleHabitForToday = (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const hasCompleted = habit.completedDates.includes(today);
        const newDates = hasCompleted
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];
        
        // Подсчет текущей серии
        const streak = calculateStreak(newDates);
        
        return {
          ...habit,
          completedDates: newDates,
          streak,
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort();
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!dates.includes(dateStr)) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">🔥 Привычки</h2>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Новая привычка..."
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
        >
          <PlusIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="bg-white/10 border border-white/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabitForToday(habit.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    habit.completedDates.includes(new Date().toISOString().split('T')[0])
                      ? 'bg-green-500'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <FireIcon className="w-5 h-5 text-white" />
                </button>
                <span className="text-white font-medium">{habit.name}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-orange-500/20 rounded-lg">
                  <span className="text-orange-300 font-medium">
                    🔥 {habit.streak} дней
                  </span>
                </div>
                
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-red-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 