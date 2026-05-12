'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon | React.ElementType;
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
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group h-full"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-r from-lime-400/0 via-lime-400/20 to-lime-400/0 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 h-full flex flex-col hover:bg-neutral-900/80 transition-colors shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-lime-400/15 transition-colors duration-500"></div>
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/20 shadow-[inset_0_0_12px_rgba(132,204,22,0.1)] group-hover:border-lime-400/40 group-hover:bg-lime-400/20 transition-all duration-300">
            <Icon className="w-6 h-6 text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]" />
          </div>
        </div>

        <div className="mt-auto relative z-10">
          <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-neutral-50 to-neutral-400 tracking-tight drop-shadow-sm">{value}</p>
            {subtitle && <span className="text-sm font-semibold text-lime-500/80 uppercase tracking-wide">{subtitle}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(KPICard);
