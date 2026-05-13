'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3 } from 'lucide-react';

const generateCSVReport = (creators: any[]) => {
  const headers = [
    'Creator Name',
    'Platform',
    'Status',
    'Followers',
    'Engagement Rate',
    'Total Views',
    'Spend ($)',
  ];

  const rows = creators.map((creator) => [
    creator.creator_name,
    creator.platform,
    creator.approval_status,
    creator.followers || 0,
    `${creator.engagement_rate || 0}%`,
    creator.views || 0,
    creator.base_price || 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `magicfit_campaign_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function fetchCreators() {
      try {
        const { supabase } = await import('../../../lib/supabase/client');
        const { data } = await supabase.from('creators').select('*');
        if (data) setCreators(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  if (!mounted) return null;
  if (loading) return <div className="p-10 text-white">Loading reports...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 text-white min-h-screen bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaign Reports</h1>
          <p className="text-neutral-400">Generate and download campaign performance data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-white/5 rounded-lg p-6 hover:border-lime-400/30 transition group">
            <div className="w-12 h-12 rounded-lg bg-lime-400/10 flex items-center justify-center mb-4 group-hover:bg-lime-400/20 transition">
              <FileText className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Full Campaign Export</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Download a complete CSV containing all creator metrics, statuses, and financial data for your records.
            </p>
            <button
              onClick={() => generateCSVReport(creators)}
              className="w-full bg-lime-400 hover:bg-lime-300 text-neutral-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}