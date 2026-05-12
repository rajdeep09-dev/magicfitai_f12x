'use client';

import { motion } from 'framer-motion';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ fullScreen = false, message = 'Loading', size = 'md' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        repeatDelay: 0.5,
      },
    },
  };

  const dotVariants = {
    initial: {
      y: 0,
      opacity: 0.5,
    },
    animate: {
      y: [-8, 8, -8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  const wrapperClass = fullScreen ? 'fixed inset-0 z-50' : '';
  const contentClass = fullScreen ? 'flex items-center justify-center' : 'flex flex-col items-center justify-center';

  const container = (
    <div className={`${contentClass} ${fullScreen ? 'h-screen bg-neutral-950' : 'gap-4'}`}>
      {/* Main Loader */}
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className={`${sizeClasses[size]} absolute inset-0 border-2 border-transparent border-t-lime-400 border-r-lime-400/50 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner pulsing ring */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`${sizeClasses[size]} border-2 border-lime-400/30 rounded-full`}
        />

        {/* Animated dots */}
        <motion.div
          variants={containerVariants}
          animate="animate"
          className={`absolute inset-0 flex items-center justify-center gap-1.5`}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              className={`${dotSizes[size]} bg-lime-400 rounded-full`}
            />
          ))}
        </motion.div>
      </div>

      {/* Loading text */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-neutral-50">{message}</p>
          <motion.p
            className="text-xs text-neutral-500 mt-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {'.'.repeat(((Date.now() / 500) % 3) + 1)}
          </motion.p>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return <div className={wrapperClass}>{container}</div>;
  }

  return container;
}
