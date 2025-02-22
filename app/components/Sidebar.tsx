'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartPieIcon,
  CheckCircleIcon,
  CalendarIcon,
  FolderIcon,
  TrophyIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Дашборд', icon: ChartPieIcon, path: '/dashboard' },
  { name: 'Задачи', icon: CheckCircleIcon, path: '/tasks' },
  { name: 'Календарь', icon: CalendarIcon, path: '/calendar' },
  { name: 'Проекты', icon: FolderIcon, path: '/projects' },
  { name: 'Миссии', icon: TrophyIcon, path: '/missions' },
  { name: 'Достижения', icon: StarIcon, path: '/achievements' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen bg-gray-800 text-white transition-all duration-300 fixed left-0 top-0`}
    >
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-end text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ArrowRightCircleIcon className="w-6 h-6" />
          ) : (
            <ArrowLeftCircleIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6" />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="w-1 h-8 bg-purple-400 absolute right-0 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 