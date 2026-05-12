'use client';

import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatorCard from '@/components/CreatorCard';
import CreatorModal from '@/components/CreatorModal';
import { createClient } from '@/lib/supabase/client';

export default function CreatorsPage() {
  const { isEditor } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

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

  const filteredCreators = creators.filter(c => 
    c.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 text-white min-h-screen bg-[#050505]">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black tracking-tighter">CREATOR ROSTER</h1>
        <div className="flex items-center gap-4">
            <input 
                type="text"
                placeholder="Search creators..."
                className="bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-widest focus:border-lime-400 outline-none w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isEditor && (
            <button 
                onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }}
                className="bg-lime-400 text-black px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-lime-300 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add
            </button>
            )}
        </div>
      </div>


      {loading ? (
        <div className="text-neutral-500 font-bold tracking-widest uppercase text-xs">Loading Roster...</div>
      ) : creators.length === 0 ? (
        <div className="text-neutral-500 font-bold">No creators in database</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((c) => (
            <div key={c.id} onClick={() => { setSelectedCreator(c); setIsModalOpen(true); }} className="cursor-pointer">
              <CreatorCard
                id={c.id}
                name={c.creator_name}
                platform={c.platform}
                followers={c.followers || 0}
                engagementRatio={Number(c.engagement_rate) || 0}
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
        onSave={async () => { setIsModalOpen(false); await loadCreators(); }}
        creator={selectedCreator}
      />
    </div>
  );
}