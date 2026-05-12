'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatorCard from '@/components/CreatorCard';
import CreatorModal from '@/components/CreatorModal';
import { createClient } from '@/lib/supabase/client';
import { Creator } from '@/types/creator';

export default function CreatorsPage() {
  const { isEditor } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const supabase = createClient();

  const loadCreators = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('creators').select('*');
    if (!error && data) setCreators(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCreators();
  }, []);

  return (
    <div className="p-10 text-white min-h-screen bg-[#050505]">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black tracking-tighter">CREATOR ROSTER</h1>
        {isEditor && (
          <button 
            onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }}
            className="bg-lime-400 text-black px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-lime-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Creator
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 font-bold tracking-widest uppercase text-xs">Loading Roster...</div>
      ) : creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-white/5 rounded-2xl bg-neutral-900/20">
          <p className="text-neutral-500 font-bold mb-4">No creators in database</p>
          {isEditor && (
             <button onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }} className="bg-white/5 px-6 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white/10">Add First Creator</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div key={c.id} onClick={() => { setSelectedCreator(c); setIsModalOpen(true); }} className="cursor-pointer">
              <CreatorCard
                id={c.id}
                name={c.creator_name}
                platform={c.platform}
                followers={c.followers || 0}
                engagementRatio={c.engagement_rate || 0}
                payoutStatus={c.payment_status || 'pending'}
                activeOnCampaign={c.approval_status === 'Approved'}
              />
            </div>
          ))}
        </div>
      )}

      <CreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => { await loadCreators(); }}
        creator={selectedCreator}
      />
    </div>
  );
}