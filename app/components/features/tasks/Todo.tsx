import { memo, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Task } from '../../../contexts/TaskContext';

interface TodoProps {
  todo: Task;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
  onEdit?: (id: number, updates: Partial<Task>) => Promise<void>;
}

const Todo = memo(function Todo({ todo, onDelete, onToggle, onEdit }: TodoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(todo.id);
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    } finally {
      setIsToggling(false);
    }
  }, [todo.id, onToggle, isToggling]);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [todo.id, onDelete, isDeleting]);

  const handleEdit = useCallback(async () => {
    if (!onEdit || editedTitle === todo.title) {
      setIsEditing(false);
      return;
    }

    try {
      await onEdit(todo.id, { title: editedTitle });
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при редактировании:', error);
      setEditedTitle(todo.title);
    }
  }, [todo.id, todo.title, editedTitle, onEdit]);

  const priorityColor = useMemo(() => {
    switch (todo.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  }, [todo.priority]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gray-800 rounded-lg p-4 ${
        todo.completed ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={handleToggle}
            disabled={isToggling}
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

          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleEdit}
              onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
              className="flex-1 bg-gray-700 text-white px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <div className="flex-1">
              <h3 className={`text-white ${todo.completed ? 'line-through' : ''}`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-gray-400 text-sm mt-1">{todo.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
          
          {onEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <PencilIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <TrashIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {todo.date && (
        <div className="mt-2 text-sm text-gray-400">
          {new Date(todo.date).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
});

export default Todo; 