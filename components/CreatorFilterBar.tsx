'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CreatorFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  platformFilter: string;
  onPlatformChange: (platform: string) => void;
  activeOnlyFilter: boolean;
  onActiveOnlyChange: (active: boolean) => void;
  payoutFilter: string;
  onPayoutChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function CreatorFilterBar({
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  activeOnlyFilter,
  onActiveOnlyChange,
  payoutFilter,
  onPayoutChange,
  sortBy,
  onSortChange,
}: CreatorFilterBarProps) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition"
          />
        </div>

        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-lime-400 transition"
        >
          <option value="">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
        </select>

        {/* Active Campaign Filter */}
        <select
          value={activeOnlyFilter ? 'active' : 'all'}
          onChange={(e) => onActiveOnlyChange(e.target.value === 'active')}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-lime-400 transition"
        >
          <option value="all">All Creators</option>
          <option value="active">Active Campaigns Only</option>
        </select>

        {/* Payout Filter */}
        <select
          value={payoutFilter}
          onChange={(e) => onPayoutChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-lime-400 transition"
        >
          <option value="">All Payouts</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-lime-400 transition"
        >
          <option value="engagement">Sort: Engagement ↓</option>
          <option value="followers">Sort: Followers ↓</option>
          <option value="name">Sort: Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
