import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const basicAchievements = [
  {
    name: 'Стартап',
    description: 'Создайте первую задачу',
    category: 'basic',
    condition: 'Создать первую задачу',
    xpReward: 10,
    target: 1,
  },
  {
    name: 'Первая кровь',
    description: 'Завершите задачу',
    category: 'basic',
    condition: 'Завершить первую задачу',
    xpReward: 15,
    target: 1,
  },
  {
    name: 'Марафонец',
    description: 'Выполните 10 задач за день',
    category: 'basic',
    condition: 'Выполнить 10 задач за один день',
    xpReward: 30,
    target: 10,
  },
  {
    name: 'Непрерывный поток',
    description: '7 дней подряд без пропусков',
    category: 'basic',
    condition: 'Выполнять задачи 7 дней подряд',
    xpReward: 50,
    target: 7,
  },
  {
    name: 'Спринтер',
    description: 'Завершите задачу за 10 минут',
    category: 'basic',
    condition: 'Завершить задачу менее чем за 10 минут',
    xpReward: 20,
    target: 1,
  },
  {
    name: 'Утренняя пташка',
    description: '3 задачи до 8:00',
    category: 'time',
    condition: 'Выполнить 3 задачи до 8:00',
    xpReward: 25,
    target: 3,
  },
  {
    name: 'Ночной совенок',
    description: 'Задача после 23:00',
    category: 'time',
    condition: 'Выполнить задачу после 23:00',
    xpReward: 20,
    target: 1,
  },
  {
    name: 'Праздничный герой',
    description: 'Задача в выходной',
    category: 'time',
    condition: 'Выполнить задачу в выходной день',
    xpReward: 30,
    target: 1,
  },
  {
    name: 'Мастер прокрастинации',
    description: 'Перенесите задачу 5 раз',
    category: 'humor',
    condition: 'Перенести одну задачу 5 раз',
    xpReward: 25,
    target: 5,
  },
  {
    name: 'Железная воля',
    description: '30 дней без пропусков',
    category: 'complex',
    condition: 'Выполнять задачи 30 дней подряд',
    xpReward: 100,
    target: 30,
  },
  {
    name: 'Мультитаскер',
    description: '5 задач одновременно',
    category: 'complex',
    condition: 'Иметь 5 активных задач одновременно',
    xpReward: 60,
    target: 5,
  },
  {
    name: 'Легенда',
    description: 'Заработайте 10,000 XP',
    category: 'complex',
    condition: 'Накопить 10,000 XP',
    xpReward: 150,
    target: 10000,
  },
];

async function main() {
  console.log('Начало инициализации достижений...');

  // Получаем всех пользователей
  const users = await prisma.user.findMany();

  for (const user of users) {
    console.log(`Инициализация достижений для пользователя ${user.email}...`);

    // Создаем базовые достижения для каждого пользователя
    for (const achievement of basicAchievements) {
      await prisma.achievement.create({
        data: {
          ...achievement,
          progress: 0,
          achieved: false,
          userId: user.id,
        },
      });
    }
  }

  console.log('Инициализация достижений завершена!');
}

main()
  .catch((e) => {
    console.error('Ошибка при инициализации достижений:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 