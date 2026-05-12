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
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div key={c.id} onClick={() => { setSelectedCreator(c); setIsModalOpen(true); }}>
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