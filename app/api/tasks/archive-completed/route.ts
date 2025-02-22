import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// POST /api/tasks/archive-completed - архивировать выполненные задачи за вчера
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем начало и конец вчерашнего дня
    const yesterday = subDays(new Date(), 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    // Находим все выполненные задачи за вчера
    const completedTasks = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        archived: false,
        date: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
      },
    });

    // Архивируем найденные задачи
    const archivedTasks = await Promise.all(
      completedTasks.map((task) =>
        prisma.todo.update({
          where: { id: task.id },
          data: {
            archived: true,
            archivedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Задачи успешно архивированы',
      archivedCount: archivedTasks.length,
    });
  } catch (error) {
    console.error('Ошибка при архивации выполненных задач:', error);
    return NextResponse.json(
      { error: 'Ошибка при архивации выполненных задач' },
      { status: 500 }
    );
  }
} 