'use client';

import { useCampaign } from '@/contexts/CampaignContext';
import { CheckCircle, Play, Users, Calendar } from 'lucide-react';

export default function ClientDashboard() {
  const { creators, loading } = useCampaign();

  if (loading) return <div className="p-8 text-lime-400 font-bold tracking-widest uppercase text-xs bg-[#050505] min-h-screen">Loading Command Center...</div>;

  const approvedCreators = creators.filter(c => c.approval_status === 'Approved' || c.approval_status === 'Published');
  
  const estimatedReach = approvedCreators.reduce((sum, c) => sum + (c.followers || 0), 0);
  
  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Command Center</h1>
        <p className="text-neutral-400 mb-8">Campaign: Summer 2026 Launch</p>
        
        <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">Campaign Progress</h2>
            <div className="flex gap-2">
                {['Ideation', 'Sourcing', 'Approvals', 'Production', 'Live'].map((phase, idx) => (
                    <div key={phase} className="flex-1">
                        <div className={`h-2 rounded-full mb-2 ${idx <= 2 ? 'bg-lime-400' : 'bg-neutral-800'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${idx <= 2 ? 'text-white' : 'text-neutral-600'}`}>{phase}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> Approved Creators</p>
                <p className="text-4xl font-black text-white mt-2">{approvedCreators.length}</p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2"><Play className="w-4 h-4" /> Est. Reach</p>
                <p className="text-4xl font-black text-white mt-2">{(estimatedReach / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4" /> Est. Go-Live</p>
                <p className="text-4xl font-black text-lime-400 mt-2">Jun 15</p>
            </div>
        </div>

        <div className="bg-neutral-900/50 rounded-2xl p-6 border border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Approved Roster</h2>
            
            {approvedCreators.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No creators approved yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvedCreators.map(c => (
                        <div key={c.id} className="p-4 bg-neutral-900 rounded-xl border border-white/5 flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-black text-lime-400 shrink-0">
                                {c.creator_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{c.creator_name}</p>
                                <div className="flex gap-2 text-xs text-neutral-500 mt-1">
                                    <span>{c.platform}</span>
                                    <span>•</span>
                                    <span>{c.deliverable || 'Video'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${c.approval_status === 'Published' ? 'bg-lime-400/10 text-lime-400' : 'bg-neutral-800 text-white'}`}>
                                    {c.approval_status === 'Published' ? 'Complete' : 'Active'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}