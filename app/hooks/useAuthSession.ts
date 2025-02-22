import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

export function useAuthSession() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Мемоизированная функция обновления сессии с дебаунсингом
  const debouncedUpdate = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        update();
      }, 300);
    };
  }, [update]);

  // Проверка аутентификации
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Обработчик видимости страницы для обновления сессии
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [debouncedUpdate]);

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    updateSession: debouncedUpdate,
  };
} 