'use client';

import { useCampaign } from '@/contexts/CampaignContext';
import { motion } from 'framer-motion';

export default function EditorDashboard() {
  const { creators } = useCampaign();

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
        <h1 className="text-4xl font-black mb-8">EDITOR CONTROL PANEL</h1>
        <div className="grid grid-cols-4 gap-4">
             {/* Stats would go here */}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Sourced', 'Outreach', 'Negotiating', 'Signed'].map(col => (
                <div key={col} className="bg-neutral-900 rounded-2xl p-4 border border-white/5">
                    <h3 className="font-bold text-xs uppercase mb-4 text-neutral-500">{col}</h3>
                    <div className="space-y-2">
                        {creators.filter(c => c.approval_status === 'Ideation').map(c => (
                            <div key={c.id} className="p-3 bg-white/5 rounded-lg text-sm font-bold">{c.creator_name}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
