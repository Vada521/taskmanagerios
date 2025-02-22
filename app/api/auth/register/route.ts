import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    console.log('Получены данные для регистрации:', { email, name });

    // Проверяем, существует ли пользователь
    console.log('Проверяем существующего пользователя...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Пользователь уже существует:', existingUser.email);
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    console.log('Хеширование пароля...');
    const hashedPassword = await hash(password, 12);

    // Создаем нового пользователя
    console.log('Создаем нового пользователя...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        xp: 0,
        level: 1,
        gold: 0,
      },
    });

    console.log('Пользователь успешно создан:', user);
    return NextResponse.json(
      { message: 'Пользователь успешно создан', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Подробная ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя', details: error.message },
      { status: 500 }
    );
  }
} 