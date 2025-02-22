import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

// GET /api/users - получить всех пользователей
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      take: 100,
      skip: 0,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        password: true,
        xp: true,
        level: true,
        gold: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true
          }
        },
        sessions: {
          select: {
            id: true
          }
        },
        todos: {
          select: {
            id: true
          }
        },
        habits: {
          select: {
            id: true
          }
        },
        missions: {
          select: {
            id: true
          }
        },
        achievements: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    );
  }
} 