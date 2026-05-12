'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Users, Play, TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react';
import KPICard from '@/components/KPICard';

export default function DashboardPage() {
  const { isEditor, profile } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('creators').select('*');
      if (data) setCreators(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  const kpis = {
    totalCreators: creators.length,
    pending: creators.filter(c => c.approval_status === 'Video Pending Approval').length,
    published: creators.filter(c => c.approval_status === 'Published').length,
    totalSpend: creators.reduce((sum, c) => sum + Number(c.base_price || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-6 text-white">
      <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">
        {isEditor ? 'Editor Control Panel' : 'Command Center'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <KPICard icon={Users} label="Total Creators" value={kpis.totalCreators} />
        <KPICard icon={Play} label="Published" value={kpis.published} />
        <KPICard icon={DollarSign} label="Total Spend" value={`$${kpis.totalSpend.toFixed(0)}`} />
        <KPICard icon={Clock} label="Pending Review" value={kpis.pending} />
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">
            {isEditor ? 'Creator Status & Approvals' : 'Roster Status'}
        </h2>
        <div className="space-y-2">
            {creators.map((c) => (
                <div key={c.id} className="grid grid-cols-4 items-center p-4 bg-white/5 rounded-lg border border-white/5">
                    <p className="font-bold">{c.creator_name}</p>
                    <p className="text-sm text-neutral-400">{c.approval_status}</p>
                    <div className="text-sm">
                        {isEditor && (
                            <div className="flex gap-2 text-[10px]">
                                <span className={c.client_approved_creator ? "text-green-500" : "text-red-500"}>Creator: {c.client_approved_creator ? '✓' : '✗'}</span>
                                <span className={c.client_approved_video ? "text-green-500" : "text-red-500"}>Video: {c.client_approved_video ? '✓' : '✗'}</span>
                            </div>
                        )}
                    </div>
                    <p className={`text-right font-bold ${c.payment_status === 'paid' ? 'text-green-400' : 'text-neutral-500'}`}>
                        {c.payment_status}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}