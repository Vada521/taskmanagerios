import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';
import { TASK_REWARDS } from '../../../../utils/rewardCalculation';

// POST /api/tasks/[id]/complete - изменить статус выполнения задачи
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = await context.params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Неверный ID задачи' }, { status: 400 });
    }

    // Проверяем существование задачи и принадлежность пользователю
    const task = await prisma.todo.findUnique({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    // Получаем все задачи пользователя на текущий день
    const today = new Date();
    const dailyTasks = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    // Обновляем статус задачи
    const updatedTask = await prisma.todo.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });

    let rewards = {
      xpChange: 0,
      goldChange: 0,
      newLevel: null as number | null,
    };

    // Если задача была не выполнена и стала выполненной
    if (!task.completed && updatedTask.completed) {
      // Базовая награда за выполнение задачи
      rewards.xpChange = TASK_REWARDS.XP_PER_TASK;

      // Проверяем, все ли задачи на день теперь выполнены
      const isAllDailyTasksCompleted = dailyTasks.every(t => 
        t.id === taskId ? updatedTask.completed : t.completed
      );

      // Если все задачи выполнены, проверяем не был ли уже получен дневной бонус
      if (isAllDailyTasksCompleted && dailyTasks.length > 0) {
        // Проверяем, был ли уже получен дневной бонус сегодня
        const dailyBonusLog = await prisma.dailyBonusLog.findFirst({
          where: {
            userId: session.user.id,
            date: {
              gte: startOfDay(today),
              lte: endOfDay(today),
            },
          },
        });

        // Если дневной бонус еще не был получен сегодня
        if (!dailyBonusLog) {
          rewards.xpChange += TASK_REWARDS.XP_DAILY_BONUS;
          rewards.goldChange += TASK_REWARDS.GOLD_DAILY_BONUS;

          // Записываем в лог получение дневного бонуса
          await prisma.dailyBonusLog.create({
            data: {
              userId: session.user.id,
              date: today,
              xpAmount: TASK_REWARDS.XP_DAILY_BONUS,
              goldAmount: TASK_REWARDS.GOLD_DAILY_BONUS,
            },
          });
        }
      }

      // Обновляем опыт и золото пользователя
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: rewards.xpChange },
          gold: { increment: rewards.goldChange },
        },
      });

      // Проверяем, достиг ли пользователь нового уровня
      const newLevel = Math.floor(user.xp / 100) + 1;
      if (newLevel > user.level) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { level: newLevel },
        });
        rewards.newLevel = newLevel;
      }
    }
    // Если задача была выполнена и стала не выполненной
    else if (task.completed && !updatedTask.completed) {
      // Отнимаем XP за отмену выполнения задачи
      rewards.xpChange = -TASK_REWARDS.XP_PER_TASK;

      // Обновляем опыт пользователя
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: rewards.xpChange },
        },
      });
    }

    // Проверяем все остальные достижения
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    await fetch(`${baseUrl}/api/achievements/check`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    return NextResponse.json({ task: updatedTask, rewards });
  } catch (error) {
    console.error('Ошибка при изменении статуса задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка при изменении статуса задачи' },
      { status: 500 }
    );
  }
} 