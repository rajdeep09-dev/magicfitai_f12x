'use client';

import { useState, useEffect } from 'react';
import { useCampaign } from '@/contexts/CampaignContext';
import { useAuth } from '@/hooks/useAuth';
import { Users, Play, Calendar, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientDashboard() {
  const { creators, loadingCreators, fetchError } = useCampaign();
  const { profile } = useAuth();
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  
  const userRole = profile?.role || 'client';

  useEffect(() => {
    async function loadProgress() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('creator_progress').select('*').order('updated_at', { ascending: false });
        if (data) setProgressItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProgress(false);
      }
    }
    loadProgress();
  }, []);

  if (loadingCreators || loadingProgress) {
    return (
      <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading Campaign...</div>
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

  const approvedCreators = creators.filter(c => c.client_approved_creator === true);
  const estimatedReach = approvedCreators.reduce((sum, c) => sum + (c.followers || 0), 0);

  const getCreatorStage = (creatorId: string) => {
    const prog = progressItems.find(p => p.creator_id === creatorId);
    return prog ? prog.stage : 'Brief Sent';
  };

  const stages = ['Brief Sent', 'Content Draft', 'In Review', 'Published'];

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative overflow-x-hidden font-sans">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Campaign Overview</h1>
      <p className="text-neutral-400 mb-8">Summer 2026 Launch</p>
      
      {/* CAMPAIGN PROGRESS */}
      <div className="mb-12">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">Campaign Progress</h2>
        <div className="flex gap-2">
          {['Ideation', 'Sourcing', 'Approvals', 'Production', 'Live'].map((phase, idx) => (
            <div key={phase} className="flex-1">
              <div className={`h-2 rounded-full mb-2 ${idx <= 2 ? 'bg-lime-400' : 'bg-neutral-800'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${idx <= 2 ? 'text-white' : 'text-neutral-600'}`}>{phase}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> Approved Creators</p>
          <p className="text-3xl font-black text-white">{approvedCreators.length}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2"><Play className="w-4 h-4" /> Est. Total Reach</p>
          <p className="text-3xl font-black text-white">{(estimatedReach / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2 mb-2"><Calendar className="w-4 h-4" /> Est. Go-Live</p>
          <p className="text-3xl font-black text-lime-400">Jun 15</p>
        </div>
      </div>

      {/* APPROVED ROSTER */}
      <div className="bg-neutral-900/50 rounded-xl p-6 border border-white/10">
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-6">Approved Roster</h2>
        
        {approvedCreators.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-500 font-black uppercase tracking-widest text-xs">No creators approved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvedCreators.map(c => {
              const currentStage = getCreatorStage(c.id);
              const stageIdx = stages.indexOf(currentStage);
              const handleStr = c.handle ?? c.creator_name ?? '?';
              
              const basePrice = Number(c.base_price) || 0;
              const commissionRate = basePrice >= 100 ? 0.20 : 0.10;
              const f12xFee = basePrice * commissionRate;
              const payPalFee = (basePrice + f12xFee) * 0.05;
              const finalTotal = basePrice + f12xFee + payPalFee;
              const platformUrl = c.platform?.toLowerCase() === 'instagram' ? `https://instagram.com/${c.handle.replace(/^@/, '')}` : '#';

              return (
                <div key={c.id} className="bg-neutral-900 rounded-xl border border-white/10 p-5 flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-black text-lg shrink-0 border border-lime-400/30">
                        {handleStr.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">@{handleStr.replace(/^@/, '')}</p>
                        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">
                          <span className="px-1.5 py-0.5 border border-neutral-700 rounded">{c.platform || 'N/A'}</span>
                          <span className="px-1.5 py-0.5 border border-neutral-700 rounded">{c.content_type || 'Content'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <a href={platformUrl} target="_blank" rel="noreferrer" className="bg-neutral-800 hover:bg-neutral-700 text-lime-400 p-2 rounded transition">
                           <Users className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => setSelectedCreator(c)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded transition"
                        >
                          View Profile
                        </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                      <span>Progress Tracker</span>
                      <span className="text-lime-400">{currentStage}</span>
                    </div>
                    <div className="flex gap-1 h-1.5 mb-4">
                      {stages.map((s, i) => (
                        <div key={s} className={`flex-1 rounded-full ${i <= stageIdx ? 'bg-lime-400' : 'bg-neutral-800'}`} />
                      ))}
                    </div>
                    {c.draft_reel_url && (
                        <a href={c.draft_reel_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-lime-400 text-[10px] font-black uppercase tracking-widest hover:underline mb-4">
                          <Play className="w-3 h-3" /> Review Draft Video
                        </a>
                    )}
                  </div>

                  {userRole === 'editor' && (
                    <div className="mt-4 p-4 bg-[#111] border border-white/10 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between text-white/70">
                        <span>Base Creator Rate:</span>
                        <span className="text-white font-medium">${basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                        <span>F12X Agency Fee ({commissionRate * 100}%):</span>
                        <span className="text-white font-medium">${f12xFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                        <span>Payment Processing (5%):</span>
                        <span className="text-white font-medium">${payPalFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 mt-2 font-bold text-sm">
                        <span className="text-lime-400">Total Client Investment:</span>
                        <span className="text-lime-400">${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SLIDE-OVER PROFILE PANEL */}
      {selectedCreator && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedCreator(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900 border-l border-white/10 z-50 p-6 overflow-y-auto shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black uppercase tracking-widest">Creator Profile</h2>
              <button onClick={() => setSelectedCreator(null)} className="text-neutral-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-black text-2xl border border-lime-400/30 shrink-0">
                {(selectedCreator.handle ?? selectedCreator.creator_name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold">@{(selectedCreator.handle ?? selectedCreator.creator_name ?? '?').replace(/^@/, '')}</h3>
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">{selectedCreator.platform || 'N/A'}</span>
                <div className="hidden">{console.log('DEBUG: Selected Creator Object:', selectedCreator)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#050505] rounded-lg p-4 border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Followers</span>
                <span className="font-bold">{(selectedCreator.followers || 0).toLocaleString()}</span>
              </div>
              <div className="bg-[#050505] rounded-lg p-4 border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Deliverable</span>
                <span className="font-bold">{selectedCreator.content_type || 'N/A'}</span>
              </div>
              {selectedCreator.draft_reel_url && (
                <div className="col-span-2 bg-[#050505] rounded-lg p-4 border border-lime-400/20">
                    <a href={selectedCreator.draft_reel_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-lime-400 text-xs font-black uppercase tracking-widest hover:underline">
                      <Play className="w-4 h-4" /> Review Draft Video
                    </a>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4 pb-2 border-b border-white/10">Progress History</h4>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
                {progressItems.filter(p => p.creator_id === selectedCreator.id).length === 0 ? (
                  <p className="text-neutral-500 text-sm">No progress logged yet.</p>
                ) : (
                  progressItems.filter(p => p.creator_id === selectedCreator.id).map((p, i) => (
                    <div key={p.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[#050505] p-4 rounded-lg border border-white/5 shadow">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-sm text-lime-400">{p.stage}</div>
                          <time className="font-mono text-[9px] text-neutral-500">{new Date(p.updated_at).toLocaleDateString()}</time>
                        </div>
                        {p.notes && <div className="text-xs text-neutral-400 mt-2">{p.notes}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
