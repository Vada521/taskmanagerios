import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

// POST /api/achievements/check - проверить и обновить достижения
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userId = session.user.id;

    // Получаем все задачи и достижения пользователя
    const [tasks, achievements, user] = await Promise.all([
      prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.achievement.findMany({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем каждое достижение
    const updatedAchievements = await Promise.all(
      achievements.map(async (achievement) => {
        let progress = achievement.progress;
        const today = new Date();

        switch (achievement.name) {
          case 'Стартап':
            progress = tasks.length > 0 ? 1 : 0;
            break;

          case 'Первая кровь':
            progress = tasks.some(task => task.completed) ? 1 : 0;
            break;

          case 'Марафонец': {
            const completedToday = tasks.filter(
              task => task.completed && isToday(task.updatedAt)
            ).length;
            progress = completedToday;
            break;
          }

          case 'Спринтер': {
            const quickTasks = tasks.filter(task => {
              if (!task.completed) return false;
              const completionTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
              return completionTime <= 10 * 60 * 1000; // 10 минут
            }).length;
            progress = quickTasks;
            break;
          }

          case 'Утренняя пташка': {
            const morningTasks = tasks.filter(task => {
              if (!task.completed) return false;
              const completionHour = new Date(task.updatedAt).getHours();
              return completionHour < 8;
            }).length;
            progress = morningTasks;
            break;
          }

          case 'Ночной совенок': {
            const nightTasks = tasks.filter(task => {
              if (!task.completed) return false;
              const completionHour = new Date(task.updatedAt).getHours();
              return completionHour >= 23;
            }).length;
            progress = nightTasks;
            break;
          }

          case 'Праздничный герой': {
            const weekendTasks = tasks.filter(task => {
              if (!task.completed) return false;
              const completionDate = new Date(task.updatedAt);
              const isToday = completionDate.toDateString() === today.toDateString();
              const isWeekend = completionDate.getDay() === 0 || completionDate.getDay() === 6;
              return isToday && isWeekend;
            }).length;
            progress = weekendTasks;
            break;
          }

          case 'Мультитаскер': {
            const activeTasks = tasks.filter(task => 
              !task.completed && task.date && isToday(task.date)
            ).length;
            progress = activeTasks;
            break;
          }

          case 'Легенда':
            progress = user.xp;
            break;
        }

        // Если прогресс изменился и достижение еще не получено
        if (progress !== achievement.progress && !achievement.achieved) {
          const shouldAchieve = progress >= achievement.target;
          
          // Если достижение будет получено, начисляем XP
          if (shouldAchieve) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                xp: { increment: achievement.xpReward }
              }
            });
          }

          return prisma.achievement.update({
            where: { id: achievement.id },
            data: {
              progress,
              achieved: shouldAchieve,
              achievedAt: shouldAchieve ? today : null,
            },
          });
        }

        return achievement;
      })
    );

    return NextResponse.json(updatedAchievements);
  } catch (error) {
    console.error('Ошибка при проверке достижений:', error);
    return NextResponse.json(
      { error: 'Ошибка при проверке достижений' },
      { status: 500 }
    );
  }
} 