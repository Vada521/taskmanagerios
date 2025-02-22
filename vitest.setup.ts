import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Мокаем react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { role: 'img', 'aria-label': 'график прогресса' })
}));

// Мокаем framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children)
  },
  AnimatePresence: ({ children }: any) => children
}));

// Мокаем date-fns
vi.mock('date-fns', () => ({
  format: () => '01 янв 2024',
  isToday: () => false,
  isYesterday: () => false,
  startOfDay: () => new Date(),
  endOfDay: () => new Date()
}));

// Мокаем next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/'
})); 