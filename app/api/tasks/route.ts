import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  xpReward: number;
  progress: number;
  target: number;
  level: string;
  achieved: boolean;
  achievedAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/tasks - получить все задачи пользователя
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const tasks = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        archived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Проверяем просроченные задачи
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const processedTasks = tasks.map(task => {
      // Если у задачи есть дата, преобразуем её в начало того дня
      const taskDate = task.date ? new Date(new Date(task.date).setHours(0, 0, 0, 0)) : null;
      const isOverdue = taskDate && taskDate < startOfToday && !task.completed;
      return {
        ...task,
        isOverdue,
      };
    });

    return NextResponse.json(processedTasks);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST /api/tasks - создать новую задачу
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    
    // Проверяем обязательные поля
    if (!data.title) {
      return NextResponse.json(
        { error: 'Название задачи обязательно' },
        { status: 400 }
      );
    }

    // Создаем задачу с данными пользователя
    const task = await prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        project: data.project,
        repeat: data.repeat || 'never',
        completed: false,
        date: data.date ? new Date(data.date) : null,
        expanded: false,
        isEditing: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании задачи' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - обновить задачу
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    // Проверяем, существует ли задача и принадлежит ли она пользователю
    const existingTask = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    const updatedTask = await prisma.todo.update({
      where: { id },
      data: updateData,
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

// DELETE /api/tasks - удалить задачу
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json(
        { error: 'Не указан идентификатор задачи' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли задача и принадлежит ли она пользователю
    const existingTask = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id },
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