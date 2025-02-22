import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';
import { calculateLevelFromXP } from '../../../utils/levelCalculation';
import { calculateMissionRewards } from '../../../utils/rewardCalculation';

const XP_PER_MISSION = 20; // XP за выполнение миссии
const GOLD_PER_MISSION = 2; // Монеты за выполнение миссии

// GET /api/missions/[id] - получить миссию по ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    const mission = await prisma.mission.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Миссия не найдена' }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error('Ошибка при получении миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении миссии' },
      { status: 500 }
    );
  }
}

// PUT /api/missions/[id] - обновить миссию
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const data = await request.json();

    // Проверяем, принадлежит ли миссия пользователю
    const existingMission = await prisma.mission.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingMission) {
      return NextResponse.json({ error: 'Миссия не найдена' }, { status: 404 });
    }

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ mission: updatedMission });
  } catch (error) {
    console.error('Ошибка при обновлении миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении миссии' },
      { status: 500 }
    );
  }
}

// DELETE /api/missions/[id] - удалить миссию
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    // Проверяем, принадлежит ли миссия пользователю
    const existingMission = await prisma.mission.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingMission) {
      return NextResponse.json({ error: 'Миссия не найдена' }, { status: 404 });
    }

    await prisma.mission.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Миссия удалена' });
  } catch (error) {
    console.error('Ошибка при удалении миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении миссии' },
      { status: 500 }
    );
  }
} 