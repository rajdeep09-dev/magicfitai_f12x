'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCampaign } from '@/contexts/CampaignContext';
import { Play } from 'lucide-react';

const STAGES = ['Brief Sent', 'Content Draft', 'In Review', 'Published', 'Approved'];

export default function TimelinePage() {
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [userRole, setUserRole] = useState<'editor'|'client'|null>(null);
  const { creators, loadingCreators, fetchError } = useCampaign();

  const loadProgress = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('creator_progress').select('*');
      if (data) setProgressItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (data) setUserRole(data.role as 'editor' | 'client');
        }
      } catch (err) {
        console.error(err);
      }
      loadProgress();
    }
    init();
  }, []);

  const handleStageClick = async (creatorId: string, newStage: string) => {
    if (userRole !== 'editor') return;
    try {
      const supabase = createClient();
      const existing = progressItems.find(p => p.creator_id === creatorId);
      
      let error;
      if (existing) {
        const { error: err } = await supabase.from('creator_progress').update({ stage: newStage, updated_at: new Date().toISOString() }).eq('creator_id', creatorId).select().single();
        error = err;
      } else {
        const { error: err } = await supabase.from('creator_progress').insert([{ creator_id: creatorId, stage: newStage }]).select().single();
        error = err;
      }
      
      if (error) throw error;
      await loadProgress();
    } catch (e: any) {
      console.error('Update failed:', e);
      alert(`Failed to update stage: ${e.message}`);
    }
  };

  if (loadingCreators || loadingProgress) {
    return <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center animate-pulse">Loading Timeline...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-8 text-red-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center">
        Error: {fetchError}
      </div>
    );
  }

  const approvedCreators = creators.filter(c => c.client_approved_creator === true);

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative font-sans">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Campaign Timeline</h1>
      <p className="text-neutral-400 mb-8">Track all 5 production stages for approved creators.</p>

      {approvedCreators.length === 0 ? (
        <div className="text-center text-neutral-600 text-xs uppercase tracking-widest py-20">No creators in production yet</div>
      ) : (
        <div className="space-y-6">
          {approvedCreators.map(c => {
            const prog = progressItems.find(p => p.creator_id === c.id);
            const currentStage = prog ? prog.stage : 'Brief Sent';
            const stageIdx = STAGES.indexOf(currentStage);
            const handleStr = c.handle ?? c.creator_name ?? '?';
            const showVideoLink = stageIdx >= 1 && c.draft_reel_url;
            
            return (
              <div key={c.id} className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-64 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-lime-400 font-black text-xl shrink-0">
                    {handleStr.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-white truncate">@{handleStr.replace(/^@/, '')}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] uppercase border border-neutral-700 px-1.5 py-0.5 rounded text-neutral-400 inline-block w-fit">{c.platform || 'N/A'}</span>
                      {showVideoLink && (
                        <a href={c.draft_reel_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-lime-400 text-[10px] font-black uppercase tracking-widest hover:underline">
                          <Play className="w-3 h-3" /> Review Draft
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full relative pt-2 pb-6">
                  <div className="absolute top-4 left-0 w-full h-1 bg-neutral-800 -z-10 rounded-full" />
                  <div 
                    className="absolute top-4 left-0 h-1 bg-lime-400 -z-10 rounded-full transition-all duration-500" 
                    style={{ width: `${(stageIdx / (STAGES.length - 1)) * 100}%` }} 
                  />

                  <div className="flex justify-between relative">
                    {STAGES.map((stage, i) => {
                      const isCompleted = i < stageIdx;
                      const isCurrent = i === stageIdx;
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => handleStageClick(c.id, stage)}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-lime-400' : isCurrent ? 'bg-[#050505] border-2 border-lime-400' : 'bg-neutral-900 border-2 border-neutral-700 group-hover:border-neutral-500'}`}>
                            {isCurrent && <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest absolute top-8 whitespace-nowrap text-center ${isCompleted || isCurrent ? 'text-lime-400' : 'text-neutral-600 group-hover:text-neutral-400'}`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}