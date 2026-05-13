'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamicImport from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';

const DynamicCalendar = dynamicImport(() => import('@/components/CalendarWrapper'), { ssr: false });

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

export default function CalendarPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      const { data } = await supabase.from('creators').select('*');
      if (data) setCreators(data);
      setLoading(false);
    }
    fetchCreators();
  }, []);

  const generateCalendarEvents = () => {
    const events: any[] = [];
    creators.forEach((creator) => {
      if (creator.live_date) {
        events.push({
          id: `${creator.id}-live`,
          date: creator.live_date,
          title: `${creator.creator_name.replace('@', '')} Goes Live`,
          type: 'published',
          creator: creator.creator_name,
        });
      }
    });
    return events;
  };

  const events = generateCalendarEvents();

  if (loading) return <div className="p-10 text-white">Loading calendar...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 text-white min-h-screen bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Calendar</h1>
          <p className="text-neutral-400">View all your campaign milestones and dates.</p>
        </div>

        <div className="bg-neutral-900 border border-white/5 rounded-lg p-6">
          <DynamicCalendar events={events} />
        </div>
      </motion.div>
    </div>
  );
}
