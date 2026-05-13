'use client';

import { useCampaign } from '@/contexts/CampaignContext';
import { motion } from 'framer-motion';

export default function ClientDashboard() {
  const { remainingBudget } = useCampaign();

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">CLIENT COMMAND CENTER</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 rounded-2xl p-6 border border-white/5">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Remaining Budget</p>
                <p className="text-4xl font-black text-lime-400 mt-2">${remainingBudget.toLocaleString()}</p>
            </div>
            {/* Additional Client Stats here */}
        </div>
    </div>
  );
}
