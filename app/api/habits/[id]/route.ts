import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { isToday, subDays, parseISO } from 'date-fns';

// Функция для расчета текущей серии
function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  
  // Сортируем даты
  const sortedDates = [...completedDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Проверяем, есть ли отметка за сегодня
  const lastDate = parseISO(sortedDates[0]);
  if (!isToday(lastDate)) return 0;
  
  let streak = 1;
  let currentDate = subDays(new Date(), 1);
  
  // Проходим по предыдущим дням
  for (let i = 1; i < sortedDates.length; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (!completedDates.includes(dateStr)) break;
    
    streak++;
    currentDate = subDays(currentDate, 1);
  }
  
  return streak;
}

// PUT /api/habits/[id] - обновить привычку
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const data = await request.json();

    // Проверяем, принадлежит ли привычка пользователю
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: 'Привычка не найдена' }, { status: 404 });
    }

    // Рассчитываем текущую серию
    const streak = calculateStreak(data.completedDates || []);

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        ...data,
        streak,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Ошибка при обновлении привычки:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении привычки' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - удалить привычку
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Проверяем, принадлежит ли привычка пользователю
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: 'Привычка не найдена' }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Привычка удалена' });
  } catch (error) {
    console.error('Ошибка при удалении привычки:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении привычки' },
      { status: 500 }
    );
  }
} 