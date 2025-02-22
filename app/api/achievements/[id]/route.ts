import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

interface AchievementUpdateData {
  progress: number;
  achieved?: boolean;
  achievedAt?: Date | null;
}

// PUT /api/achievements/[id] - обновить достижение
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const achievementId = params.id;
    const data = await request.json() as AchievementUpdateData;

    // Проверяем, принадлежит ли достижение пользователю
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId: session.user.id,
      },
    });

    if (!existingAchievement) {
      return NextResponse.json({ error: 'Достижение не найдено' }, { status: 404 });
    }

    // Обновляем достижение
    const updatedAchievement = await prisma.achievement.update({
      where: { id: achievementId },
      data: {
        ...data,
        // Если достигнут прогресс цели и достижение еще не получено
        achieved: data.progress >= existingAchievement.target && !existingAchievement.achieved
          ? true
          : existingAchievement.achieved,
        achievedAt: data.progress >= existingAchievement.target && !existingAchievement.achieved
          ? new Date()
          : existingAchievement.achievedAt,
      },
    });

    // Если достижение только что получено, начисляем XP
    if (updatedAchievement.achieved && !existingAchievement.achieved) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: {
            increment: existingAchievement.xpReward
          }
        }
      });
    }

    return NextResponse.json(updatedAchievement);
  } catch (error) {
    console.error('Ошибка при обновлении достижения:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении достижения' },
      { status: 500 }
    );
  }
} 