'use client';

import { useCampaign } from '@/contexts/CampaignContext';
import KPICard from '@/components/KPICard';
import { DollarSign, Users, Play } from 'lucide-react';

export default function ClientDashboard() {
  const { creators, remainingBudget, budget } = useCampaign();

  const kpis = {
    total: creators.length,
    approved: creators.filter(c => c.approval_status === 'Approved').length,
    totalSpent: budget - remainingBudget
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">Command Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <KPICard icon={DollarSign} label="Remaining Budget" value={`$${remainingBudget.toFixed(0)}`} />
            <KPICard icon={Users} label="Total Creators" value={kpis.total} />
            <KPICard icon={Play} label="Approved" value={kpis.approved} />
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Current Roster Status</h2>
            <div className="space-y-3">
                {creators.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                        <div>
                            <p className="font-bold">{c.creator_name}</p>
                            <p className="text-xs text-neutral-500">{c.platform}</p>
                        </div>
                        <p className={`font-bold ${c.approval_status === 'Approved' ? 'text-lime-400' : 'text-yellow-500'}`}>
                            {c.approval_status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
