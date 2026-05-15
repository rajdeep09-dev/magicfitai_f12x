'use client';

import { useState, useEffect } from 'react';
import { Plus, Info, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import CreatorCard from '@/components/CreatorCard';
import CreatorModal from '@/components/CreatorModal';
import { createClient } from '@/lib/supabase/client';
import { Creator } from '@/types/creator';
import Papa from 'papaparse';

import { useRouter } from 'next/navigation';

export default function CreatorsPage() {
  const { isEditor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isEditor) {
      router.push('/dashboard');
    }
  }, [isEditor, loading, router]);

  const { creators, loadingCreators, fetchError, loadCreators } = useCampaign();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [showCSVInfo, setShowCSVInfo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const parseKNumber = (val: any): number => {
    if (typeof val === 'string' && val.toLowerCase().endsWith('k')) {
      const num = parseFloat(val.replace(/k/i, ''));
      return isNaN(num) ? 0 : num * 1000;
    }
    return parseFloat(val) || 0;
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows: any[] = results.data;
          const creatorsToInsert = [];
          
          for (const obj of rows) {
            if (!obj.handle && !obj.creator_name) continue;

            creatorsToInsert.push({
              campaign_id: obj.campaign_id || '00000000-0000-0000-0000-000000000000',
              handle: obj.handle || '',
              creator_name: obj.creator_name || obj.handle || 'Unknown',
              platform: obj.platform || 'Instagram',
              followers: parseKNumber(obj.followers),
              engagement_rate: parseKNumber(obj.engagement_rate),
              base_price: parseFloat(obj.base_price) || 0,
              final_price: parseFloat(obj.final_price) || parseFloat(obj.base_price) || 0,
              approval_status: obj.approval_status || 'Sourced',
              lang: obj.lang || 'English'
            });
          }

          if (creatorsToInsert.length === 0) throw new Error("No valid creators found in CSV");

          const supabase = createClient();
          const { error } = await supabase.from('creators').insert(creatorsToInsert);
          if (error) throw error;
          
          await loadCreators();
          showToast(`Successfully imported ${creatorsToInsert.length} creators`, 'success');
        } catch (err: any) {
          showToast(`Import failed: ${err.message}`, 'error');
        }
        e.target.value = ''; // reset input
      },
      error: (error) => {
        showToast(`CSV Parse error: ${error.message}`, 'error');
        e.target.value = ''; // reset input
      }
    });
  };

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
            <>
              <button 
                  onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }}
                  className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-neutral-200 flex items-center gap-2"
              >
                  <Plus className="w-4 h-4" /> Add
              </button>
              <div className="flex items-center gap-1">
                <label className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest px-6 py-3 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
                   Import CSV
                   <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                </label>
                <button 
                  onClick={() => setShowCSVInfo(!showCSVInfo)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white p-3 rounded-lg transition-colors"
                  title="CSV Format Info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </>
            )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl border font-bold text-xs shadow-lg z-50 transition-all flex items-center gap-2 ${toast.type === 'success' ? 'bg-lime-400 text-black border-lime-500' : 'bg-red-500 text-white border-red-600'}`}>
          {toast.message}
        </div>
      )}

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

      {/* CSV Info Modal */}
      {showCSVInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative">
            <button 
              onClick={() => setShowCSVInfo(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-white mb-2">CSV Import Format</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Your CSV file must include headers in the first row. Here are the expected column names:
            </p>
            <div className="bg-[#050505] border border-white/5 rounded-xl p-4 text-xs font-mono text-neutral-300 space-y-2 mb-6">
              <p><span className="text-lime-400">handle</span> (Required) - Creator's handle</p>
              <p><span className="text-lime-400">creator_name</span> (Optional) - Display name</p>
              <p><span className="text-lime-400">platform</span> (Optional) - Instagram, TikTok, YouTube, Twitter</p>
              <p><span className="text-lime-400">followers</span> (Optional) - Number or 'k' format (e.g. 15k)</p>
              <p><span className="text-lime-400">engagement_rate</span> (Optional) - Number or 'k' format (e.g. 12k or 5.2)</p>
              <p><span className="text-lime-400">base_price</span> (Optional) - Number</p>
              <p><span className="text-lime-400">approval_status</span> (Optional) - e.g. Sourced, Outreach</p>
            </div>
            <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400/80 p-3 rounded-lg text-xs font-bold">
              Tip: You can use 'k' suffixes for large numbers (e.g. 15k will become 15000).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
