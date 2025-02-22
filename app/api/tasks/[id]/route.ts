import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

// GET /api/tasks/[id] - получить задачу по ID
export async function GET(
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

    const task = await prisma.todo.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении задачи' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - обновить задачу
export async function PUT(
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

    const updates = await request.json();

    // Проверяем, существует ли задача и принадлежит ли она пользователю
    const existingTask = await prisma.todo.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: updates,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении задачи' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - удалить задачу
export async function DELETE(
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

    // Проверяем, существует ли задача и принадлежит ли она пользователю
    const existingTask = await prisma.todo.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении задачи' },
      { status: 500 }
    );
  }
} 