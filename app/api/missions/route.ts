import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

// GET /api/missions - получить все миссии пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const missions = await prisma.mission.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(missions);
  } catch (error) {
    console.error('Ошибка при получении миссий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении миссий' },
      { status: 500 }
    );
  }
}

// POST /api/missions - создать новую миссию
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, folder, target, unit, color, startDate, endDate } = data;

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        folder,
        target,
        unit,
        color,
        startDate,
        endDate,
        userId: session.user.id,
      },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании миссии' },
      { status: 500 }
    );
  }
}

// PUT /api/missions - обновить миссию
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    // Проверяем, существует ли миссия и принадлежит ли она пользователю
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
      data: updateData,
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error('Ошибка при обновлении миссии:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении миссии' },
      { status: 500 }
    );
  }
}

// DELETE /api/missions - удалить миссию
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Не указан идентификатор миссии' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли миссия и принадлежит ли она пользователю
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