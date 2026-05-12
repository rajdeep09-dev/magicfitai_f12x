'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  delay?: number;
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6 group hover:border-lime-400/50 transition"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-lime-400/10 group-hover:bg-lime-400/20 transition">
          <Icon className="w-6 h-6 text-lime-400" />
        </div>
      </div>

      <h3 className="text-neutral-400 text-sm font-medium mb-2">{label}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-neutral-50">{value}</p>
        {subtitle && <span className="text-xs text-neutral-500">{subtitle}</span>}
      </div>
    </motion.div>
  );
}

export default memo(KPICard);
