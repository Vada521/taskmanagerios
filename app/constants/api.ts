export const API_ENDPOINTS = {
  TASKS: {
    BASE: '/api/tasks',
    COMPLETE: (id: number) => `/api/tasks/${id}/complete`,
    BY_ID: (id: number) => `/api/tasks/${id}`,
  },
  MISSIONS: {
    BASE: '/api/missions',
    BY_ID: (id: string) => `/api/missions/${id}`,
    PROGRESS: (id: string) => `/api/missions/${id}/progress`,
  },
  ACHIEVEMENTS: {
    BASE: '/api/achievements',
    BY_ID: (id: string) => `/api/achievements/${id}`,
  },
  AUTH: {
    SESSION: '/api/auth/session',
    CSRF: '/api/auth/csrf',
  },
} as const;

export const API_CACHE_TIME = {
  SHORT: 5000, // 5 seconds
  MEDIUM: 30000, // 30 seconds
  LONG: 300000, // 5 minutes
} as const;

export const API_DEBOUNCE_TIME = {
  SHORT: 300, // 300ms
  MEDIUM: 500, // 500ms
  LONG: 1000, // 1 second
} as const; 