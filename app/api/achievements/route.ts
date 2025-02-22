import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/achievements - получить все достижения пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const achievements = await prisma.achievement.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        achievedAt: 'desc',
      },
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Ошибка при получении достижений:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении достижений' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - создать новое достижение
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await req.json();
    const achievement = await prisma.achievement.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании достижения:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании достижения' },
      { status: 500 }
    );
  }
} 