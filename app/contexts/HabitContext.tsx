import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  streak: number;
}

interface HabitContextType {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  addHabit: (name: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date) => Promise<void>;
  getHabitStats: () => {
    bestHabit: string | null;
    worstHabit: string | null;
    averageCompletion: number;
  };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      if (!response.ok) throw new Error('Ошибка при загрузке привычек');
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (name: string) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Ошибка при создании привычки');
      const newHabit = await response.json();
      setHabits(prevHabits => [...prevHabits, newHabit]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Ошибка при удалении привычки');
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      throw err;
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Привычка не найдена');

      const dateStr = format(date, 'yyyy-MM-dd');
      const completedDates = new Set(habit.completedDates);
      
      if (completedDates.has(dateStr)) {
        completedDates.delete(dateStr);
      } else {
        completedDates.add(dateStr);
      }

      const updatedDates = Array.from(completedDates).sort();

      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedDates: updatedDates,
        }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении привычки');
      const updatedHabit = await response.json();

      setHabits(prevHabits => 
        prevHabits.map(h => h.id === habitId ? updatedHabit : h)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      throw err;
    }
  };

  const getHabitStats = () => {
    if (habits.length === 0) {
      return {
        bestHabit: null,
        worstHabit: null,
        averageCompletion: 0,
      };
    }

    const habitStats = habits.map(habit => ({
      name: habit.name,
      completionRate: habit.completedDates.length,
      streak: habit.streak,
    }));

    const bestHabit = habitStats.reduce((prev, current) =>
      (current.streak > prev.streak) ? current : prev
    );

    const worstHabit = habitStats.reduce((prev, current) =>
      (current.streak < prev.streak) ? current : prev
    );

    const totalCompletions = habitStats.reduce((sum, stat) => sum + stat.completionRate, 0);
    const averageCompletion = Math.round((totalCompletions / habits.length) * 100) / 100;

    return {
      bestHabit: bestHabit.name,
      worstHabit: worstHabit.name,
      averageCompletion,
    };
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        isLoading,
        error,
        addHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabitStats,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
} 