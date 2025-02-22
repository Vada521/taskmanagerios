import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { calculateMissionRewards } from '@/app/utils/rewardCalculation';
import { calculateLevelFromXP } from '@/app/utils/levelCalculation';

// POST /api/missions/[id]/progress - обновить прогресс миссии
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    const { progress } = data;

    if (typeof progress !== 'number') {
      return NextResponse.json(
        { error: 'Некорректное значение прогресса' },
        { status: 400 }
      );
    }

    // Получаем текущую миссию
    const mission = await prisma.mission.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Миссия не найдена' }, { status: 404 });
    }

    // Проверяем, была ли миссия завершена до обновления
    const wasCompleted = mission.progress >= mission.target;
    const willBeCompleted = progress >= mission.target;

    // Обновляем прогресс миссии
    const updatedMission = await prisma.mission.update({
      where: { id: params.id },
      data: {
        progress,
        status: progress >= mission.target ? 'completed' : progress > 0 ? 'in_progress' : 'backlog',
        progressHistory: {
          push: {
            date: new Date(),
            progress
          }
        },
        updatedAt: new Date(),
      },
    });

    // Если статус завершения изменился, обновляем награды
    if (wasCompleted !== willBeCompleted) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, gold: true }
      });

      if (user) {
        const { xpChange, goldChange } = calculateMissionRewards({
          wasCompleted,
          isCompleted: willBeCompleted
        });

        const newXp = Math.max(0, user.xp + xpChange);
        const newLevel = calculateLevelFromXP(newXp);
        const newGold = Math.max(0, user.gold + goldChange);

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: newXp,
            level: newLevel,
            gold: newGold
          },
        });

        return NextResponse.json({
          mission: updatedMission,
          rewards: {
            xpChange,
            goldChange,
            newLevel: newLevel > user.level ? newLevel : null
          }
        });
      }
    }

    return NextResponse.json({ mission: updatedMission });
  } catch (error) {
    console.error('Ошибка при обновлении прогресса:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении прогресса' },
      { status: 500 }
    );
  }
} 