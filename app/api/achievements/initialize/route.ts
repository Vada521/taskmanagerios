import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { basicAchievements } from '../../../utils/achievements';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userId = session.user.id;

    // Проверяем, есть ли уже достижения у пользователя
    const existingAchievements = await prisma.achievement.findMany({
      where: { userId },
    });

    if (existingAchievements.length > 0) {
      return NextResponse.json({ message: 'Достижения уже инициализированы' });
    }

    // Создаем базовые достижения для пользователя
    const achievements = await Promise.all(
      basicAchievements.map(achievement =>
        prisma.achievement.create({
          data: {
            ...achievement,
            progress: 0,
            achieved: false,
            userId,
          },
        })
      )
    );

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Ошибка при инициализации достижений:', error);
    return NextResponse.json(
      { error: 'Ошибка при инициализации достижений' },
      { status: 500 }
    );
  }
} 