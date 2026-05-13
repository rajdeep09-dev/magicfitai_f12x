'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';

// Hard-bypass SSR for the charts component to prevent build crashes
const DynamicCharts = dynamicImport(() => import('@/components/AnalyticsCharts'), { ssr: false });

export default function AnalyticsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('creators').select('*');
      if (data) setCreators(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading analytics...</div>;

  const totalViews = creators.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalSpend = creators.reduce((sum, c) => sum + (Number(c.base_price) || 0), 0);

  const creatorPerformanceData = creators.map((c) => ({
    name: c.creator_name.replace('@', ''),
    views: c.views || 0,
    engagement: Number(c.engagement_rate) || 0,
  }));

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

      {/* Dynamically loaded chart component */}
      <DynamicCharts data={creatorPerformanceData} />
    </div>
  );
}
