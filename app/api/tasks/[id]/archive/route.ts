import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

// POST /api/tasks/[id]/archive - архивировать задачу
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Неверный ID задачи' }, { status: 400 });
    }

    // Проверяем существование задачи и принадлежность пользователю
    const task = await prisma.todo.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    // Архивируем задачу
    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: {
        archived: true,
        archivedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Ошибка при архивации задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при архивации задачи' },
      { status: 500 }
    );
  }
} 