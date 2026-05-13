'use client';

import { useState } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import KPICard from '@/components/KPICard';
import { Users, Play, DollarSign, Clock, Search, Filter, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function EditorDashboard() {
  const { creators, loading, loadCreators, budget, remainingBudget } = useCampaign();
  
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('creators').update({ approval_status: newStatus }).eq('id', id);
      if (error) throw error;
      showToast(`Status updated to ${newStatus}`, 'success');
      loadCreators();
    } catch (e) {
      console.error(e);
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="p-8 text-lime-400 font-bold tracking-widest uppercase text-xs bg-[#050505] min-h-screen">Loading Editor Panel...</div>;

  const totalSpend = budget - remainingBudget;
  const pending = creators.filter(c => c.approval_status === 'Video Pending Approval').length;

  const filteredCreators = creators.filter(c => {
    if (search && !c.creator_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (platformFilter && c.platform !== platformFilter) return false;
    return true;
  });

  const columns = ['Sourced', 'Outreach', 'Negotiating', 'Signed'];

  const getNextStatus = (current: string) => {
    const idx = columns.indexOf(current);
    if (idx >= 0 && idx < columns.length - 1) return columns[idx + 1];
    if (current === 'Signed') return 'Video Pending Approval';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative">
      {toast && (
        <div className={`fixed top-20 right-8 px-4 py-2 rounded shadow-lg z-50 text-sm font-bold transition-opacity ${toast.type === 'success' ? 'bg-lime-400 text-neutral-950' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Editor Control Panel</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-neutral-900 border border-white/10 p-2 rounded-lg hover:border-lime-400 transition">
          <Filter className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <KPICard icon={Users} label="Total Creators" value={creators.length} />
            <KPICard icon={DollarSign} label="Total Budget" value={`$${budget}`} />
            <KPICard icon={DollarSign} label="Spent" value={`$${totalSpend.toFixed(0)}`} />
            <KPICard icon={DollarSign} label="Remaining" value={`$${remainingBudget.toFixed(0)}`} />
            <KPICard icon={Clock} label="Pending Review" value={pending} />
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-bold uppercase tracking-wider">
              <span>Budget Usage</span>
              <span>{Math.round((totalSpend / budget) * 100)}%</span>
            </div>
            <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 transition-all" style={{ width: `${Math.min((totalSpend / budget) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="mb-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search creators..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-lime-400 outline-none text-white placeholder-neutral-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {columns.map(col => {
              const colCreators = filteredCreators.filter(c => c.approval_status === col);
              return (
                <div key={col} className="bg-neutral-900/30 rounded-2xl p-4 border border-white/5 flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-widest">{col}</h3>
                    <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">{colCreators.length}</span>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {colCreators.map(c => (
                      <div key={c.id} className="p-4 bg-neutral-900 rounded-lg border border-white/5 hover:border-white/10 transition group">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 font-bold text-xs text-lime-400">
                            {c.creator_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{c.creator_name}</div>
                            <div className="text-xs text-neutral-500">{c.platform}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-neutral-400">${c.base_price || 0}</span>
                          <span className="px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 font-bold truncate max-w-[80px] text-[10px]">{c.approval_status}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getNextStatus(c.approval_status) && (
                            <button 
                              onClick={() => handleStatusChange(c.id, getNextStatus(c.approval_status)!)}
                              className="flex-1 bg-white/5 hover:bg-white/10 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition"
                            >
                              Move <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {colCreators.length === 0 && (
                      <div className="text-center text-neutral-600 text-xs py-8">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sidebarOpen && (
          <div className="w-64 bg-neutral-900 border border-white/10 rounded-2xl p-6 shrink-0 h-fit sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold uppercase tracking-widest text-sm text-lime-400">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}><X className="w-4 h-4 text-neutral-500 hover:text-white" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-widest">Platform</label>
                <select 
                  className="w-full bg-[#050505] border border-white/10 text-white rounded px-3 py-2 text-sm outline-none focus:border-lime-400"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
