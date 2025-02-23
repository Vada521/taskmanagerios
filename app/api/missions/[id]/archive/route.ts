import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { calculateMissionRewards } from '../../../../utils/rewardCalculation';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const missionId = params.id;

    // Проверяем, принадлежит ли миссия пользователю
    const existingMission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        userId: session.user.id,
      },
    });

    if (!existingMission) {
      return NextResponse.json({ error: 'Миссия не найдена' }, { status: 404 });
    }

    // Рассчитываем награды за выполнение миссии
    const rewards = calculateMissionRewards({
      wasCompleted: existingMission.status === 'completed',
      isCompleted: true
    });

    // Получаем текущие значения пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, gold: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Обновляем статус миссии и награды пользователя
    const [updatedMission] = await prisma.$transaction([
      prisma.mission.update({
        where: { id: missionId },
        data: { status: 'completed' },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: user.xp + rewards.xpChange,
          gold: user.gold + rewards.goldChange
        }
      })
    ]);

    return NextResponse.json({ mission: updatedMission });
  } catch (error) {
    console.error('Ошибка при архивации миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при архивации миссии' },
      { status: 500 }
    );
  }
} 