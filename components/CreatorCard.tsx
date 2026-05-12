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
      className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg overflow-hidden hover:border-lime-400/50 transition group"
    >
      {/* Active Campaign Badge */}
      {activeOnCampaign && (
        <div className="bg-lime-500/20 border-b border-lime-500/30 px-4 py-2">
          <p className="text-xs font-semibold text-lime-400">
            ✓ Active: {campaignName || 'Campaign in progress'}
          </p>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center flex-shrink-0 text-neutral-950 font-bold text-lg">
              {name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-50 truncate">{name}</p>
              <p className="text-xs text-neutral-400">{platform}</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Followers */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-neutral-400" />
              <p className="text-xs text-neutral-400">Followers</p>
            </div>
            <p className="text-lg font-bold text-neutral-50">{(followers / 1000).toFixed(1)}K</p>
          </div>

          {/* Engagement Ratio */}
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-lime-400" />
              <p className="text-xs text-neutral-400">Engagement</p>
            </div>
            <p className="text-lg font-bold text-lime-400">{engagementRatio.toFixed(1)}%</p>
          </div>
        </div>

        {/* Payout Status */}
        <div className={`rounded-lg p-3 border ${statusColors.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-400" />
              <p className="text-xs text-neutral-400">Payout Status</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors.text} ${statusColors.badge}`}>
              {payoutStatus.charAt(0).toUpperCase() + payoutStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-neutral-800/30 border-t border-neutral-700 px-6 py-3 flex gap-2">
        <button className="flex-1 text-sm font-medium text-neutral-400 hover:text-lime-400 transition py-2 rounded hover:bg-neutral-700/50">
          View Profile
        </button>
        <button className="flex-1 text-sm font-medium text-lime-400 hover:text-lime-300 transition py-2 rounded hover:bg-lime-500/10">
          Details →
        </button>
      </div>
    </motion.div>
  );
}

export default memo(CreatorCard);
