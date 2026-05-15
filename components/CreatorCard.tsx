import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import Image from 'next/image';

interface CreatorCardProps {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagementRatio: number;
  payoutStatus: 'pending' | 'paid' | 'processing' | 'waiting_for_tolt';
  activeOnCampaign: boolean;
  campaignName?: string;
  avatarUrl?: string;
  index?: number;
}

const PAYOUT_STATUS_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  'paid': { bg: 'bg-green-900/20', text: 'text-green-400', badge: 'bg-green-500/20' },
  'pending': { bg: 'bg-yellow-900/20', text: 'text-yellow-400', badge: 'bg-yellow-500/20' },
  'processing': { bg: 'bg-blue-900/20', text: 'text-blue-400', badge: 'bg-blue-500/20' },
  'waiting_for_tolt': { bg: 'bg-purple-900/20', text: 'text-purple-400', badge: 'bg-purple-500/20' },
};

function CreatorCard({
  id,
  name,
  platform,
  followers,
  engagementRatio,
  payoutStatus,
  activeOnCampaign,
  campaignName,
  avatarUrl,
  index = 0,
}: CreatorCardProps) {
  const statusColors = PAYOUT_STATUS_COLORS[payoutStatus];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="relative group h-full bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:bg-neutral-900/60 hover:border-lime-400/30 hover:shadow-[0_0_40px_rgba(132,204,22,0.05)] transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500/0 via-lime-500/40 to-lime-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Active Campaign Badge */}
      {activeOnCampaign && (
        <div className="bg-lime-400/10 border-b border-white/5 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(132,204,22,1)]"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-lime-400/90">
              Active Campaign
            </p>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 truncate max-w-[150px]">
            {campaignName || 'Magicfit Summer'}
          </p>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-lime-400 to-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-14 h-14 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center flex-shrink-0 text-neutral-50 font-black text-xl shadow-xl">
              {(name ?? '?').charAt(0)}
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-neutral-50 text-lg truncate group-hover:text-lime-100 transition-colors leading-tight">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">{platform}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Followers */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 group-hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Audience</p>
            </div>
            <p className="text-xl font-black text-neutral-50">
                {followers > 1000 ? `${(followers / 1000).toFixed(1)}K` : followers}
            </p>
          </div>

          {/* Engagement / Avg Views */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 group-hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x' ? 'Avg Views' : 'Engage'}
              </p>
            </div>
            <p className="text-xl font-black text-lime-400">
              {platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x' 
                ? (engagementRatio >= 1000 ? `${(engagementRatio / 1000).toFixed(1)}K` : engagementRatio.toString()) 
                : `${engagementRatio.toFixed(1)}%`}
            </p>
          </div>
        </div>

        {/* Payout Status */}
        <div className={`rounded-xl p-3.5 border ${statusColors.bg} ${statusColors.badge.replace('bg-', 'border-')} shadow-inner group-hover:brightness-110 transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-300/70" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Payment</p>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${statusColors.text} ${statusColors.badge}`}>
              {payoutStatus === 'waiting_for_tolt' ? 'Tolt Process' : payoutStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-neutral-950/40 border-t border-white/5 px-6 py-4 flex gap-3">
        <button className="flex-1 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-50 transition-all py-2.5 rounded-lg border border-transparent hover:bg-white/5">
          Profile
        </button>
        <button className="flex-1 text-xs font-black uppercase tracking-widest bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-all py-2.5 rounded-lg shadow-[0_0_15px_rgba(132,204,22,0.2)] hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]">
          Details →
        </button>
      </div>
    </motion.div>
  );
}

export default memo(CreatorCard);
