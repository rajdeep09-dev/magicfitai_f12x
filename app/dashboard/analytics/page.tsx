'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { createClient } from '@/lib/supabase/client';

export default function AnalyticsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
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

  const platformBreakdownData = [
    { name: 'Instagram', value: creators.filter((c) => c.platform === 'Instagram').reduce((sum, c) => sum + (c.views || 0), 0) },
    { name: 'TikTok', value: creators.filter((c) => c.platform === 'TikTok').reduce((sum, c) => sum + (c.views || 0), 0) },
    { name: 'YouTube', value: creators.filter((c) => c.platform === 'YouTube').reduce((sum, c) => sum + (c.views || 0), 0) },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creatorPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Bar dataKey="views" fill="#AEE078" />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}