'use client';

import { ReactNode, useMemo } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  CheckCircleIcon,
  TrophyIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import UserInfo from './UserInfo';
import PageTransition from './PageTransition';
import { AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const navigation = useMemo(() => [
    { name: 'Дашборд', href: '/dashboard', icon: HomeIcon },
    { name: 'Задачи', href: '/tasks', icon: CheckCircleIcon },
    { name: 'Миссии', href: '/missions', icon: TrophyIcon },
    { name: 'Привычки', href: '/habits', icon: ClockIcon },
    { name: 'Календарь', href: '/calendar', icon: CalendarIcon },
    { name: 'Проекты', href: '/projects', icon: FolderIcon },
  ], []);

  console.log('[DashboardLayout] Статус сессии:', status);
  console.log('[DashboardLayout] Сессия:', session);
  console.log('[DashboardLayout] Текущий путь:', pathname);

  // Если пользователь не аутентифицирован и загрузка сессии завершена, 
  // перенаправляем на страницу входа
  if (status === 'unauthenticated' && pathname !== '/') {
    console.log('[DashboardLayout] Перенаправление на страницу входа');
    router.push('/');
    return null;
  }

  // Если сессия загружается, показываем экран загрузки
  if (status === 'loading') {
    console.log('[DashboardLayout] Показываю экран загрузки');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  console.log('[DashboardLayout] Рендерю основной интерфейс');
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Боковое меню */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            GamePlanner
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        <div className="p-4">
          <Link
            href="/archive"
            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
              pathname === '/archive'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title="Архив"
          >
            <ArchiveBoxIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1">
        {/* Верхняя панель */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-16">
              <div className="flex items-center gap-4">
                <UserInfo />
                <button
                  onClick={() => {
                    console.log('[DashboardLayout] Выход из системы');
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-300"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Выход</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Контент страницы */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
} 