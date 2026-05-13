export const dynamic = "force-dynamic";
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

const STATUS_COLORS: Record<string, string> = {
  'Ideation': 'bg-gray-600',
  'Script Sent': 'bg-blue-600',
  'Video Pending Approval': 'bg-yellow-600',
  'Revisions Requested': 'bg-orange-600',
  'Approved': 'bg-green-600',
  'Published': 'bg-lime-500',
};

const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const getDaysUntil = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getProgressPercentage = (fromDate: string, toDate: string) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const now = new Date();

  if (now < from) return 0;
  if (now > to) return 100;

  const total = to.getTime() - from.getTime();
  const elapsed = now.getTime() - from.getTime();
  return Math.round((elapsed / total) * 100);
};

export default function TimelinePage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const startDate = '2026-05-01';
  const endDate = '2026-08-31';

  useEffect(() => {
    async function fetchCreators() {
      const supabase = supabase;
      const { data } = await supabase.from('creators').select('*');
      if (data) setCreators(data);
      setLoading(false);
    }
    fetchCreators();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading timeline...</div>;

  const sortedCreators = [...creators].sort((a, b) => {
    if (!a.live_date || !b.live_date) return 0;
    return new Date(a.live_date).getTime() - new Date(b.live_date).getTime();
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 text-white min-h-screen bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Timeline</h1>
          <p className="text-neutral-400">Gantt view of your campaign.</p>
        </div>

        <div className="bg-neutral-900 border border-white/5 rounded-lg overflow-hidden">
          <div className="space-y-2 p-4">
            {sortedCreators.length === 0 && <p className="text-neutral-500">No creators found.</p>}
            {sortedCreators.map((creator, idx) => {
              const daysUntil = creator.live_date ? getDaysUntil(creator.live_date) : null;
              const isUpcoming = daysUntil !== null && daysUntil > 0;

              return (
                <div key={creator.id} className="flex gap-4 items-center group hover:bg-neutral-800/30 p-2 rounded transition">
                  <div className="w-40 flex-shrink-0">
                    <p className="text-sm font-medium text-white truncate">{creator.creator_name}</p>
                    <p className="text-xs text-neutral-500">{creator.platform}</p>
                  </div>
                  <div className="flex-1 h-10 bg-neutral-800/30 rounded relative overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[creator.approval_status] || 'bg-neutral-700'} opacity-70`}
                      style={{ width: `${Math.max(5, (creator.progress_score / 100) * 100)}%` }}
                    />
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-xs text-neutral-400">{creator.live_date ? getMonthYear(creator.live_date) : 'TBD'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
