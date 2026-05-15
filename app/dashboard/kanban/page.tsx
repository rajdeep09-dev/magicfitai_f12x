'use client';

import { useState } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { Search, Filter, Check, ArrowRight, ArrowLeft, Trash2, X, Plus, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CreatorModal from '@/components/CreatorModal';
import Papa from 'papaparse';

import { useAuth } from '@/hooks/useAuth';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KanbanPage() {
  const { creators, loadingCreators, fetchError, loadCreators } = useCampaign();
  const { isEditor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isEditor) {
      router.push('/dashboard');
    }
  }, [isEditor, loading, router]);

  
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [showCSVInfo, setShowCSVInfo] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const KANBAN_STAGES = ['Sourced', 'Outreach', 'Negotiating', 'Approved'];

  const moveToNextStage = async (creatorId: string, currentStatus: string) => {
    try {
      const safeStatus = currentStatus || 'Sourced';
      const currentIndex = KANBAN_STAGES.indexOf(safeStatus);
      if (currentIndex === -1 || currentIndex === KANBAN_STAGES.length - 1) return;
      const nextStage = KANBAN_STAGES[currentIndex + 1];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('creators')
        .update({ approval_status: nextStage })
        .eq('id', creatorId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No rows updated');

      await loadCreators();
      showToast(`Moved to ${nextStage}`, 'success');
    } catch (err: any) {
      console.error('Update failed:', err);
      showToast(`Failed to update: ${err.message}`, 'error');
    }
  };

  const moveBackStage = async (creatorId: string, currentStatus: string) => {
    try {
      const safeStatus = currentStatus || 'Sourced';
      const currentIndex = KANBAN_STAGES.indexOf(safeStatus);
      if (currentIndex <= 0) return;
      const prevStage = KANBAN_STAGES[currentIndex - 1];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('creators')
        .update({ approval_status: prevStage })
        .eq('id', creatorId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No rows updated');

      await loadCreators();
      showToast(`Moved back to ${prevStage}`, 'success');
    } catch (err: any) {
      console.error('Update failed:', err);
      showToast(`Failed to move back: ${err.message}`, 'error');
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this creator?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', creatorId);
      
      if (error) throw error;

      await loadCreators();
      showToast(`Creator deleted successfully`, 'success');
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
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

  if (loadingCreators) {
    return (
      <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading Kanban Pipeline...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 text-red-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center">
        Error: {fetchError}
      </div>
    );
  }

  const filteredCreators = creators.filter(c => {
    const handleStr = c.handle ?? c.creator_name ?? '';
    if (search && !handleStr.toLowerCase().includes(search.toLowerCase())) return false;
    if (platformFilter && c.platform !== platformFilter) return false;
    // Don't show fully approved ones if they've moved to production, but keep Approved for the final column
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative font-sans">
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl border font-bold text-xs shadow-lg z-50 transition-all flex items-center gap-2 ${toast.type === 'success' ? 'bg-lime-400 text-black border-lime-500' : 'bg-red-500 text-white border-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Sourcing Kanban</h1>
            <p className="text-neutral-400 text-sm mt-1">Move creators from Sourced through Approved.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isEditor && (
            <>
              <button onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }} className="bg-lime-400 text-black font-black uppercase text-xs px-4 py-2 rounded-xl hover:bg-lime-300 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Creator
              </button>
              <div className="flex items-center gap-1">
                <label className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer">
                   Import CSV
                   <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                </label>
                <button 
                  onClick={() => setShowCSVInfo(!showCSVInfo)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white p-2 rounded-xl transition-colors"
                  title="CSV Format Info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search handles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-lime-400 outline-none text-white placeholder-neutral-500"
            />
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-neutral-900 border border-white/10 p-2 rounded-xl hover:border-lime-400 transition flex items-center justify-center">
            <Filter className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* PIPELINE COLUMNS */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          {KANBAN_STAGES.map(col => {
            const colCreators = filteredCreators.filter(c => (c.approval_status ?? 'Sourced').toLowerCase() === col.toLowerCase());
            return (
              <div key={col} className="bg-neutral-900/40 rounded-xl p-3 border border-white/5 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-black text-[10px] uppercase text-neutral-500 tracking-widest">{col}</h3>
                  <span className="text-[10px] font-black bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{colCreators.length}</span>
                </div>
                <div className="space-y-3">
                  {colCreators.map(c => {
                    const handleStr = c.handle ?? c.creator_name ?? '?';
                    const platformUrl = c.platform?.toLowerCase() === 'instagram' ? `https://instagram.com/${handleStr.replace(/^@/, '')}` : 
                                        c.platform?.toLowerCase() === 'twitter' ? `https://twitter.com/${handleStr.replace(/^@/, '')}` : '#';
                    return (
                    <div key={c.id} className="p-4 bg-neutral-900 rounded-xl border border-white/10 shadow-sm flex flex-col gap-3 relative group">
                      <div className="flex items-center gap-3">
                         <a href={platformUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-black shrink-0 hover:ring-2 ring-lime-400 transition-all">
                            {handleStr.charAt(0).toUpperCase()}
                         </a>
                         <div className="min-w-0">
                            <span className="font-bold text-sm text-white truncate block">@{handleStr.replace(/^@/, '')}</span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-400 inline-block mt-1">{c.platform || 'N/A'}</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-white/5">
                        <span>{c.content_type || 'Post'}</span>
                        <span className="font-black text-lime-400">${c.base_price || 0}</span>
                      </div>
                      {isEditor && (
                        <div className="pt-2 flex gap-2">
                          <button 
                            onClick={() => handleDeleteCreator(c.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded transition flex items-center justify-center"
                            title="Delete Creator"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {col !== 'Sourced' && (
                            <button 
                              onClick={() => moveBackStage(c.id, c.approval_status ?? 'Sourced')}
                              className="bg-white/5 hover:bg-white/10 text-white p-1.5 rounded transition flex items-center justify-center"
                              title="Move Back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col !== 'Approved' && (
                            <button 
                              onClick={() => moveToNextStage(c.id, c.approval_status ?? 'Sourced')}
                              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[9px] py-1.5 rounded transition flex items-center justify-center gap-1"
                            >
                              Move <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {col === 'Negotiating' && (
                             <button 
                               onClick={() => moveToNextStage(c.id, 'Approved')}
                               className="flex-1 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[9px] py-1.5 rounded transition flex items-center justify-center gap-1"
                             >
                               Approve <Check className="w-3 h-3" />
                             </button>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                  {colCreators.length === 0 && (
                    <div className="text-center text-neutral-700 text-xs py-4 font-black uppercase tracking-widest">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDEBAR FILTERS */}
        {sidebarOpen && (
          <div className="w-64 bg-neutral-900 border border-white/10 rounded-xl p-5 shrink-0 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase tracking-widest text-xs text-lime-400">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}><X className="w-4 h-4 text-neutral-500 hover:text-white" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-500 mb-2 tracking-widest">Platform</label>
                <select 
                  className="w-full bg-[#050505] border border-white/10 text-white rounded px-3 py-2 text-sm outline-none focus:border-lime-400"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

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