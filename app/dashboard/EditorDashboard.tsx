'use client';

import { useCampaign } from '@/contexts/CampaignContext';
import KPICard from '@/components/KPICard';
import { Users, Play, DollarSign, Clock } from 'lucide-react';

export default function EditorDashboard() {
  const { creators } = useCampaign();

  const kpis = {
    total: creators.length,
    pending: creators.filter(c => c.approval_status === 'Video Pending Approval').length,
    published: creators.filter(c => c.approval_status === 'Published').length,
    totalSpend: creators.reduce((sum, c) => sum + Number(c.base_price || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">Editor Control Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard icon={Users} label="Total Creators" value={kpis.total} />
            <KPICard icon={Play} label="Published" value={kpis.published} />
            <KPICard icon={DollarSign} label="Total Spend" value={`$${kpis.totalSpend.toFixed(0)}`} />
            <KPICard icon={Clock} label="Pending Review" value={kpis.pending} />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Sourced', 'Outreach', 'Negotiating', 'Signed'].map(col => (
                <div key={col} className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
                    <h3 className="font-bold text-xs uppercase mb-6 text-neutral-500 tracking-widest">{col}</h3>
                    <div className="space-y-3">
                        {creators.map(c => (
                            <div key={c.id} className="p-4 bg-white/5 rounded-lg border border-white/5 text-sm font-bold">{c.creator_name}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
