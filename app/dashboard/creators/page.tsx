'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import CreatorCard from '@/components/CreatorCard';
import CreatorModal from '@/components/CreatorModal';
import { supabase } from '../../../lib/supabase/client';
import { Creator } from '@/types/creator';

export default function CreatorsPage() {
  const { isEditor } = useAuth();
  const { creators, loadingCreators, fetchError, loadCreators } = useCampaign();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  const filteredCreators = creators
    .filter(c => {
      const handleStr = c.handle ?? c.creator_name ?? '';
      return handleStr.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter(c => !showRecommendedOnly || c.is_recommended)
    .sort((a, b) => {
        if (sortBy === 'price') return (b.base_price || 0) - (a.base_price || 0);
        if (sortBy === 'followers') return (b.followers || 0) - (a.followers || 0);
        const nameA = a.handle ?? a.creator_name ?? '';
        const nameB = b.handle ?? b.creator_name ?? '';
        return nameA.localeCompare(nameB);
    });

  if (loadingCreators) return <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center animate-pulse">Loading Roster...</div>;
  if (fetchError) return <div className="p-8 text-red-400 font-bold bg-[#050505] min-h-screen">Error: {fetchError}</div>;

  return (
    <div className="p-10 text-white min-h-screen bg-[#050505]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <h1 className="text-4xl font-black tracking-tighter">CREATOR ROSTER</h1>
        
        <div className="flex flex-wrap items-center gap-3">
            <input 
                type="text"
                placeholder="Search..."
                className="bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
                className="bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="name">Sort: Name</option>
                <option value="price">Sort: Price</option>
                <option value="followers">Sort: Followers</option>
            </select>
            <button 
                onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
                className={`px-4 py-3 rounded-lg font-bold uppercase text-xs tracking-widest border ${showRecommendedOnly ? 'bg-lime-400 text-black border-lime-400' : 'bg-neutral-900 border-white/10'}`}
            >
                F12X Picks
            </button>
            {isEditor && (
            <button 
                onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }}
                className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-neutral-200 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add
            </button>
            )}
        </div>
      </div>

      {filteredCreators.length === 0 ? (
        <div className="text-neutral-500 font-bold">No creators found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((c) => {
            const handleStr = c.handle ?? c.creator_name ?? '?';
            return (
              <div key={c.id} onClick={() => { setSelectedCreator(c); setIsModalOpen(true); }} className="cursor-pointer">
                <CreatorCard
                  id={c.id}
                  name={handleStr}
                  platform={c.platform || ''}
                  followers={c.followers || 0}
                  engagementRatio={Number(c.engagement_rate) || 0}
                  payoutStatus={c.payment_status || 'pending'}
                  activeOnCampaign={c.approval_status === 'Approved'}
                />
              </div>
            );
          })}
        </div>
      )}

      <CreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async () => { setIsModalOpen(false); await loadCreators(); }}
        creator={selectedCreator}
      />
    </div>
  );
}
