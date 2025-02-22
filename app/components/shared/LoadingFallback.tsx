'use client';

import { motion } from 'framer-motion';

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Загрузка...' }: LoadingFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[200px] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">{message}</p>
      </div>
    </motion.div>
  );
}

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingFallback />
    </div>
  );
} 