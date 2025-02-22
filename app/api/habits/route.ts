import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

// GET /api/habits - получить все привычки пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Ошибка при получении привычек:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении привычек' },
      { status: 500 }
    );
  }
}

// POST /api/habits - создать новую привычку
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Название привычки обязательно' },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        userId: session.user.id,
        completedDates: [],
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Ошибка при создании привычки:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании привычки' },
      { status: 500 }
    );
  }
} 