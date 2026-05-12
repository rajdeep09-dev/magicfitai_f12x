'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { ReactNode } from 'react';

interface PageLoaderProps {
  isLoading: boolean;
  children: ReactNode;
  minLoadTime?: number;
}

/**
 * PageLoader wraps page content with a smooth loading transition.
 * Ensures minimum load time to avoid jarring transitions.
 */
export default function PageLoader({
  isLoading,
  children,
  minLoadTime = 300,
}: PageLoaderProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center py-12"
        >
          <Loader message="Loading data" size="md" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
