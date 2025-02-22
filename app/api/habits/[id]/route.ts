import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

// PUT /api/habits/[id] - обновить привычку
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

    // Проверяем, принадлежит ли привычка пользователю
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: 'Привычка не найдена' }, { status: 404 });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Ошибка при обновлении привычки:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении привычки' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - удалить привычку
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

    // Проверяем, принадлежит ли привычка пользователю
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: 'Привычка не найдена' }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Привычка удалена' });
  } catch (error) {
    console.error('Ошибка при удалении привычки:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении привычки' },
      { status: 500 }
    );
  }
} 