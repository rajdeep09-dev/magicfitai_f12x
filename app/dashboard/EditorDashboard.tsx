'use client';

import { useState, useEffect } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { Users, DollarSign, Clock, Search, Filter, Check, ArrowRight, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TOAST_DURATION = 3000;

function Toast({ message, type, onClose }: { message: string, type: 'success'|'error', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl border font-bold text-xs shadow-lg z-50 transition-all transform flex items-center gap-2 ${type === 'success' ? 'bg-lime-400 text-black border-lime-500' : 'bg-red-500 text-white border-red-600'}`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
    </div>
  );
}

const STAGES = ['Sourced', 'Outreach', 'Negotiating', 'Signed', 'Approved'];

export default function EditorDashboard() {
  const { creators, loadingCreators, fetchError, loadCreators, budget, remainingBudget } = useCampaign();
  
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loadingBudget, setLoadingBudget] = useState(true);
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  
  const [toast, setToast] = useState<{ id: number, message: string, type: 'success' | 'error' } | null>(null);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: toastIdCounter + 1, message, type });
    setToastIdCounter(prev => prev + 1);
  };

  const loadBudget = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('campaign_budget').select('*');
      if (data) setBudgetItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBudget(false);
    }
  };

  const loadProgress = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('creator_progress').select('*');
      if (data) setProgressItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    loadBudget();
    loadProgress();
  }, []);

  const handleUpdateBudgetSpent = async (id: string, newSpent: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('campaign_budget').update({ spent: newSpent }).eq('id', id);
      if (error) throw error;
      showToast('Budget updated successfully', 'success');
      loadBudget();
    } catch (e) {
      showToast('Failed to update budget', 'error');
    }
  };

  const moveToNextStage = async (creatorId: string, currentStatus: string) => {
    try {
      const safeStatus = currentStatus || 'Sourced';
      const currentIndex = STAGES.indexOf(safeStatus);
      if (currentIndex === -1 || currentIndex === STAGES.length - 1) return;
      const nextStage = STAGES[currentIndex + 1];
      
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
      showToast(`Progress updated to ${nextStage}`, 'success');
    } catch (err: any) {
      console.error('Update failed:', err);
      showToast(`Failed to update: ${err.message}`, 'error');
    }
  };

  const handleApprove = async (creatorId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('creators').update({ approval_status: 'Approved' }).eq('id', creatorId);
      if (error) throw error;
      showToast('Creator Approved', 'success');
      await loadCreators();
    } catch (e) {
      showToast('Failed to approve creator', 'error');
    }
  };

  const handleUpdateProgress = async (creatorId: string, newStage: string) => {
    try {
      const supabase = createClient();
      const existing = progressItems.find(p => p.creator_id === creatorId);
      if (existing) {
        const { error } = await supabase.from('creator_progress').update({ stage: newStage, updated_at: new Date().toISOString() }).eq('creator_id', creatorId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('creator_progress').insert([{ creator_id: creatorId, stage: newStage }]);
        if (error) throw error;
      }
      showToast(`Progress updated to ${newStage}`, 'success');
      loadProgress();
    } catch (e) {
      showToast('Failed to update progress', 'error');
    }
  };

  if (loadingCreators || loadingBudget || loadingProgress) {
    return (
      <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading Workspace...</div>
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

  const totalAllocated = budgetItems.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 5000;
  const totalSpentBudget = budgetItems.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  const remainingBudgetCalc = totalAllocated - totalSpentBudget;
  const pendingReview = creators.filter(c => !c.approval_status || c.approval_status === 'Sourced').length;

  const filteredCreators = creators.filter(c => {
    const handleStr = c.handle ?? c.creator_name ?? '';
    if (search && !handleStr.toLowerCase().includes(search.toLowerCase())) return false;
    if (platformFilter && c.platform !== platformFilter) return false;
    return true;
  });

  const COLUMNS = [
    { label: 'SOURCED', status: 'Sourced' },
    { label: 'OUTREACH', status: 'Outreach' },
    { label: 'NEGOTIATING', status: 'Negotiating' },
    { label: 'SIGNED', status: 'Signed' },
  ];

  const approvedCreators = creators.filter(c => c.approval_status === 'Approved');

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative font-sans">
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><Users className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Total Creators</span></div>
          <p className="text-2xl font-black">{creators.length}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><DollarSign className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Total Budget</span></div>
          <p className="text-2xl font-black">${totalAllocated.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><DollarSign className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Spent</span></div>
          <p className="text-2xl font-black text-red-400">${totalSpentBudget.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><DollarSign className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Remaining</span></div>
          <p className="text-2xl font-black text-lime-400">${remainingBudgetCalc.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><Clock className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Pending Review</span></div>
          <p className="text-2xl font-black text-blue-400">{pendingReview}</p>
        </div>
      </div>

      {/* BUDGET MANAGER TABLE */}
      <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-8 overflow-x-auto">
        <h2 className="text-sm font-black uppercase tracking-widest mb-4">Budget Manager</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-neutral-500 text-xs uppercase tracking-widest">
              <th className="pb-3 font-bold">Label</th>
              <th className="pb-3 font-bold">Allocated</th>
              <th className="pb-3 font-bold">Spent</th>
              <th className="pb-3 font-bold">Remaining</th>
              <th className="pb-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {budgetItems.map(item => {
              const remaining = Number(item.amount) - Number(item.spent);
              return (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium">{item.label}</td>
                  <td className="py-3">${Number(item.amount).toLocaleString()}</td>
                  <td className="py-3">
                    <input 
                      type="number"
                      defaultValue={Number(item.spent)}
                      onBlur={(e) => handleUpdateBudgetSpent(item.id, Number(e.target.value))}
                      className="bg-neutral-950 border border-white/10 rounded px-2 py-1 w-24 text-white text-sm focus:border-lime-400 outline-none"
                    />
                  </td>
                  <td className={`py-3 font-bold ${remaining < 0 ? 'text-red-400' : 'text-lime-400'}`}>${remaining.toLocaleString()}</td>
                  <td className="py-3">
                    <button className="text-[10px] font-black uppercase tracking-widest text-lime-400 border border-lime-400/30 px-2 py-1 rounded hover:bg-lime-400/10">Save</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="font-black text-lime-400">
              <td className="pt-3">TOTAL</td>
              <td className="pt-3">${totalAllocated.toLocaleString()}</td>
              <td className="pt-3 text-red-400">${totalSpentBudget.toLocaleString()}</td>
              <td className="pt-3">${remainingBudgetCalc.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* KANBAN CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-widest">Kanban Pipeline</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
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
          {COLUMNS.map(col => {
            const colCreators = filteredCreators.filter(c => {
               const status = (c.approval_status ?? 'Sourced').toLowerCase();
               const match = status === col.status.toLowerCase();
               if (match) console.log(`DEBUG: Creator ${c.handle} matched column ${col.status}`);
               return match;
            });
            return (
              <div key={col.status} className="bg-neutral-900/40 rounded-xl p-3 border border-white/5 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-black text-[10px] uppercase text-neutral-500 tracking-widest">{col.label}</h3>
                  <span className="text-[10px] font-black bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{colCreators.length}</span>
                </div>
                <div className="space-y-3">
                  {colCreators.map(c => {
                    const handleStr = c.handle ?? c.creator_name ?? '?';
                    return (
                    <div key={c.id} className="p-3 bg-neutral-900 rounded-lg border border-white/10 shadow-sm flex flex-col gap-2 relative group">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white truncate pr-2">@{handleStr.replace(/^@/, '')}</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-400">{c.platform || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <span>{c.content_type || 'Post'} • {c.lang || 'N/A'}</span>
                        <span className="font-black text-lime-400">${c.base_price || 0}</span>
                      </div>
                      <div className="pt-2 flex gap-2">
                        {col.status !== 'Signed' && (
                          <button 
                            onClick={() => moveToNextStage(c.id, c.approval_status ?? 'Sourced')}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[9px] py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            Move <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleApprove(c.id)}
                          className="flex-1 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[9px] py-1.5 rounded transition flex items-center justify-center gap-1"
                        >
                          Approve <Check className="w-3 h-3" />
                        </button>
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
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* APPROVED ROSTER */}
      <div className="mt-12">
        <h2 className="text-xl font-black uppercase tracking-widest mb-6">Approved Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedCreators.map(c => {
            const prog = progressItems.find(p => p.creator_id === c.id)?.stage || 'Brief Sent';
            const handleStr = c.handle ?? c.creator_name ?? '?';
            return (
              <div key={c.id} className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-lime-400 font-black">
                      {handleStr.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">@{handleStr.replace(/^@/, '')}</p>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500">{c.platform || 'N/A'} • {(c.followers || 0).toLocaleString()} followers</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-lime-400/50 text-lime-400 bg-lime-400/10">
                    Approved
                  </span>
                </div>
                
                <div className="bg-[#050505] p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Deliverable</span>
                    <span className="text-xs text-white">{c.content_type || 'Content'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Progress</span>
                    <select
                      value={prog}
                      onChange={(e) => handleUpdateProgress(c.id, e.target.value)}
                      className="bg-neutral-800 border border-white/10 text-white text-xs px-2 py-1 rounded outline-none focus:border-lime-400"
                    >
                      <option value="Brief Sent">Brief Sent</option>
                      <option value="Content Draft">Content Draft</option>
                      <option value="In Review">In Review</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
          {approvedCreators.length === 0 && (
            <div className="text-neutral-500 text-sm font-bold col-span-full">No approved creators yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
