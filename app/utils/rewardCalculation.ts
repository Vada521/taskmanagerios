// Базовые награды за задачи
export const TASK_REWARDS = {
  XP_PER_TASK: 1,
  XP_DAILY_BONUS: 3,
  GOLD_DAILY_BONUS: 1
} as const;

// Базовые награды за миссии (квесты)
export const MISSION_REWARDS = {
  XP: 30,
  GOLD: 2
} as const;

// Базовые значения наград
const BASE_XP_TASK = 10;
const BASE_GOLD_TASK = 1;
const BASE_XP_MISSION = 20;
const BASE_GOLD_MISSION = 2;

// Множители для приоритетов задач
const PRIORITY_MULTIPLIERS = {
  low: 0.8,
  medium: 1,
  high: 1.2,
};

interface TaskRewardParams {
  wasCompleted: boolean;
  isCompleted: boolean;
  isAllDailyTasksCompleted: boolean;
}

interface MissionRewardParams {
  wasCompleted: boolean;
  isCompleted: boolean;
}

// Расчет наград за выполнение задачи
export function calculateTaskRewards({
  wasCompleted,
  isCompleted,
  isAllDailyTasksCompleted
}: TaskRewardParams) {
  let xpChange = 0;
  let goldChange = 0;

  // Если задача была не выполнена и стала выполненной
  if (!wasCompleted && isCompleted) {
    // Базовая награда за выполнение задачи
    xpChange += TASK_REWARDS.XP_PER_TASK;

    // Если это была последняя задача дня
    if (isAllDailyTasksCompleted) {
      xpChange += TASK_REWARDS.XP_DAILY_BONUS;
      goldChange += TASK_REWARDS.GOLD_DAILY_BONUS;
    }
  }
  // Если задача была выполнена и стала не выполненной (отмена)
  else if (wasCompleted && !isCompleted) {
    xpChange -= TASK_REWARDS.XP_PER_TASK;
  }

  return { xpChange, goldChange };
}

// Расчет наград за выполнение миссии
export function calculateMissionRewards({
  wasCompleted,
  isCompleted
}: MissionRewardParams) {
  let xpChange = 0;
  let goldChange = 0;

  // Если миссия была не выполнена и стала выполненной
  if (!wasCompleted && isCompleted) {
    xpChange += MISSION_REWARDS.XP;
    goldChange += MISSION_REWARDS.GOLD;
  }
  // Если миссия была выполнена и стала не выполненной (отмена)
  else if (wasCompleted && !isCompleted) {
    xpChange -= MISSION_REWARDS.XP;
    goldChange -= MISSION_REWARDS.GOLD;
  }

  return { xpChange, goldChange };
}

// Расчет наград за достижение
export function calculateAchievementRewards(level: string): {
  xpReward: number;
  goldReward: number;
} {
  const rewards = {
    bronze: { xp: 10, gold: 1 },
    silver: { xp: 50, gold: 5 },
    gold: { xp: 200, gold: 20 }
  };

  return {
    xpReward: rewards[level as keyof typeof rewards]?.xp || rewards.bronze.xp,
    goldReward: rewards[level as keyof typeof rewards]?.gold || rewards.bronze.gold
  };
} 