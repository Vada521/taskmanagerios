// Базовые константы для расчета уровней
const XP_MULTIPLIER_1_10 = 50;  // Множитель для уровней 1-10
const XP_MULTIPLIER_11_30 = 75; // Множитель для уровней 11-30
const XP_MULTIPLIER_31_50 = 100; // Множитель для уровней 31-50
const MAX_LEVEL = 50;

export function calculateRequiredXP(level: number): number {
  if (level <= 1) return XP_MULTIPLIER_1_10; // Для первого уровня нужно 50 XP
  if (level > MAX_LEVEL) return Infinity;

  if (level <= 10) {
    return XP_MULTIPLIER_1_10;
  } else if (level <= 30) {
    return XP_MULTIPLIER_11_30;
  } else {
    return XP_MULTIPLIER_31_50;
  }
}

export function calculateTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return Infinity;

  let total = 0;

  // Уровни 1-10
  if (level <= 10) {
    total += XP_MULTIPLIER_1_10 * level;
  } else {
    total += XP_MULTIPLIER_1_10 * 10;
  }

  // Уровни 11-30
  if (level > 10) {
    const levelsInSecondTier = Math.min(level - 10, 20);
    total += XP_MULTIPLIER_11_30 * levelsInSecondTier;
  }

  // Уровни 31-50
  if (level > 30) {
    const levelsInThirdTier = Math.min(level - 30, 20);
    total += XP_MULTIPLIER_31_50 * levelsInThirdTier;
  }

  return total;
}

export function calculateLevelFromXP(xp: number): number {
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let requiredXP = baseXP;

  while (xp >= requiredXP) {
    level++;
    requiredXP = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  return level;
}

export function calculateXPForLevel(level: number): number {
  const baseXP = 100;
  const multiplier = 1.5;
  return Math.floor(baseXP * Math.pow(multiplier, level - 1));
}

export function calculateProgressToNextLevel(xp: number) {
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let requiredXP = baseXP;
  
  while (xp >= requiredXP) {
    level++;
    requiredXP = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }
  
  const previousLevelXP = Math.floor(baseXP * Math.pow(multiplier, level - 2));
  const progress = xp - previousLevelXP;
  const requiredForNext = requiredXP - previousLevelXP;
  
  return {
    currentLevel: level,
    progress,
    requiredForNext,
    totalXP: xp,
    nextLevelXP: requiredXP,
    previousLevelXP,
  };
} 