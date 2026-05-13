'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    async function fetchData() {
      const { data } = await supabase.from('creators').select('*');
      if (data) setCreators(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // CRITICAL FIX: If not mounted in the browser yet, return nothing.
  // This completely stops Vercel's static builder from evaluating the code below and crashing.
  if (!mounted) return null;

  if (loading) return <div className="p-10 text-white">Loading analytics...</div>;

  const totalViews = creators.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalSpend = creators.reduce((sum, c) => sum + (Number(c.base_price) || 0), 0);

  const creatorPerformanceData = creators
    .map((c) => ({
      name: c.creator_name.replace('@', ''),
      views: c.views || 0,
      engagement: Number(c.engagement_rate) || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const maxViews = Math.max(...creatorPerformanceData.map(c => c.views), 1);

  return (
    <div className="p-10 text-white bg-[#050505] min-h-screen">
      <h1 className="text-3xl font-black mb-8">ANALYTICS</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Total Views</p>
            <p className="text-3xl font-black text-white">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Total Spend</p>
            <p className="text-3xl font-black text-lime-400">${totalSpend.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Top Creators by Views</h2>
            
            <div className="space-y-4">
              {creatorPerformanceData.length === 0 ? (
                <p className="text-neutral-500 text-sm">No data available.</p>
              ) : (
                creatorPerformanceData.map((c) => (
                  <div key={c.name} className="flex items-center gap-4">
                    <div className="w-32 truncate text-sm font-bold">{c.name}</div>
                    <div className="flex-1 h-6 bg-neutral-800 rounded-md overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-lime-400 transition-all duration-1000"
                        style={{ width: `${Math.max((c.views / maxViews) * 100, 2)}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-right text-xs text-neutral-400 font-mono">
                      {c.views.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}