'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  percentage: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  percentage,
  label,
  size = 200,
  strokeWidth = 8,
}: ProgressRingProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isAnimating ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg width={size} height={size} className="relative">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262626"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={isAnimating ? offset : circumference}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(174, 224, 120, 0.4))',
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#AEE078" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>

        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="text-3xl font-bold fill-lime-400"
          style={{ fontFamily: 'inherit' }}
        >
          {percentage}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          className="text-xs fill-neutral-400"
          style={{ fontFamily: 'inherit' }}
        >
          {label}
        </text>
      </svg>
    </motion.div>
  );
}
