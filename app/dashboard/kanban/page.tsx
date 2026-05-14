'use client';

import { useState } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { Search, Filter, Check, ArrowRight, X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CreatorModal from '@/components/CreatorModal';

import { useAuth } from '@/hooks/useAuth';

export default function KanbanPage() {
  const { creators, loadingCreators, fetchError, loadCreators } = useCampaign();
  const { isEditor } = useAuth();
  
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

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
            <button onClick={() => { setSelectedCreator(null); setIsModalOpen(true); }} className="bg-lime-400 text-black font-black uppercase text-xs px-4 py-2 rounded-xl hover:bg-lime-300 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Creator
            </button>
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
                      <div className="pt-2 flex gap-2">
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
    </div>
  );
}