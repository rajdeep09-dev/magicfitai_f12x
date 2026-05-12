'use client';

import { motion } from 'framer-motion';

interface LinearProgressProps {
  percentage: number;
  animated?: boolean;
  delay?: number;
}

export default function LinearProgress({
  percentage,
  animated = true,
  delay = 0,
}: LinearProgressProps) {
  return (
    <div className="w-full h-2 bg-neutral-800/50 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-lime-400 to-green-500 rounded-full"
        initial={animated ? { width: 0 } : { width: `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={animated ? { duration: 1, delay, ease: 'easeOut' } : { duration: 0 }}
        style={{
          boxShadow: '0 0 15px rgba(174, 224, 120, 0.4)',
        }}
      />
    </div>
  );
}
