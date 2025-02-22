import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

// GET /api/tasks/archived - получить архивные задачи
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const archivedTasks = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        archived: true,
      },
      orderBy: {
        archivedAt: 'desc',
      },
    });

    return NextResponse.json(archivedTasks);
  } catch (error) {
    console.error('Ошибка при получении архивных задач:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении архивных задач' },
      { status: 500 }
    );
  }
} 