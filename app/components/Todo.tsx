'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useAchievementContext } from '../contexts/AchievementContext';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Todo {
  id: number;
  title: string;
  description?: string;
  priority: string;
  project?: string;
  completed: boolean;
  date?: Date;
  user: User;
}

interface TodoListProps {
  todos: Todo[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function TodoList({ todos, onDelete, onToggle }: TodoListProps) {
  const { data: session } = useSession();
  const [expandedTodo, setExpandedTodo] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <motion.div
          key={todo.id}
          className={`bg-gray-800 rounded-lg p-4 ${
            todo.completed ? 'opacity-50' : ''
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onToggle(todo.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-400 hover:border-purple-500'
                }`}
              >
                {todo.completed && (
                  <CheckIcon className="w-4 h-4 text-white" />
                )}
              </button>
              <div>
                <h3 className="text-lg font-medium text-white">{todo.title}</h3>
                {todo.description && (
                  <p className="text-gray-400 text-sm mt-1">{todo.description}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  {todo.priority && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      todo.priority === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {todo.priority}
                    </span>
                  )}
                  {todo.project && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {todo.project}
                    </span>
                  )}
                  {todo.date && (
                    <span className="text-xs text-gray-400">
                      {new Date(todo.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <TrashIcon className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 