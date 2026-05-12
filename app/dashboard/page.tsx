'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Users,
  FileText,
  Play,
  TrendingUp,
  Instagram,
  Youtube,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProgressRing from '@/components/ProgressRing';
import KPICard from '@/components/KPICard';
import LinearProgress from '@/components/LinearProgress';

// Lazy load VideoApprovalPanel for better initial page load
const VideoApprovalPanel = dynamic(() => import('@/components/VideoApprovalPanel'), {
  loading: () => <div className="p-4 text-neutral-400">Loading approval panel...</div>,
  ssr: true,
});

const PLATFORM_ICONS: Record<string, any> = {
  Instagram: Instagram,
  TikTok: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.74 2.89 2.89 0 0 1 2.31-4.64 2.88 2.88 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.1z" />
    </svg>
  ),
  YouTube: Youtube,
};

interface Creator {
  id: string;
  creator_name: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  deliverable: string;
  approval_status: string;
  progress_score: number;
  views: number;
  engagement_rate: number;
  video_link: string | null;
  published_video_link: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Ideation': { bg: 'bg-gray-900/50', text: 'text-gray-400', border: 'border-gray-700' },
  'Script Sent': { bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-700' },
  'Video Pending Approval': {
    bg: 'bg-yellow-900/20',
    text: 'text-yellow-400',
    border: 'border-yellow-700',
  },
  'Revisions Requested': { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-700' },
  'Approved': { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-700' },
  'Published': { bg: 'bg-lime-900/20', text: 'text-lime-400', border: 'border-lime-700' },
};

export default function DashboardPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    setCreators(mockCreators as Creator[]);
    setLoading(false);
  }, []);

  const kpis = useMemo(() => {
    const totalCreators = creators.length;
    const pendingApproval = creators.filter((c) => c.approval_status === 'Video Pending Approval').length;
    const published = creators.filter((c) => c.approval_status === 'Published').length;
    const totalReach = creators.reduce((sum, c) => sum + c.views, 0);
    const totalSpend = creators.reduce((sum, c) => sum + c.spend, 0);
    
    return { totalCreators, pendingApproval, published, totalReach, totalSpend };
  }, [creators]);

  const pendingCreators = useMemo(
    () => creators.filter((c) => c.approval_status === 'Video Pending Approval'),
    [creators]
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-10 font-sans text-neutral-200">
      {/* Command Center Hero */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Command Center</h1>
            <p className="text-neutral-500 mt-2 text-sm uppercase tracking-widest font-bold">Campaign Performance Overview</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-lime-400">$ {kpis.totalSpend.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Total Campaign Spend</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Users} label="Active Creators" value={kpis.totalCreators} />
          <KPICard icon={Play} label="Published Content" value={kpis.published} />
          <KPICard icon={TrendingUp} label="Total Reach" value={(kpis.totalReach/1000000).toFixed(1) + 'M'} subtitle="views" />
          <KPICard icon={Clock} label="Pending Review" value={kpis.pendingApproval} />
        </div>
      </section>

      {/* Roster & Workflow Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
             <span className="w-2 h-6 bg-lime-400 rounded-full"></span> Creator Roster
          </h2>
          <div className="space-y-4">
            {creators.map((creator) => {
              const isExpanded = expandedCreator === creator.id;
              return (
                <div key={creator.id} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-lime-500/30 transition">
                  <button
                    onClick={() => setExpandedCreator(isExpanded ? null : creator.id)}
                    className="w-full p-4 flex items-center justify-between focus:outline-none"
                  >
                    <div>
                      <p className="font-bold text-white">{creator.creator_name}</p>
                      <p className="text-xs text-neutral-500">{creator.platform}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-lime-400">{creator.approval_status}</p>
                       <p className="text-xs text-neutral-600">{creator.progress_score}% Complete</p>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <VideoApprovalPanel
                      creatorName={creator.creator_name}
                      creatorId={creator.id}
                      approvalStatus={creator.approval_status}
                      videoLink={creator.video_link}
                      publishedVideoLink={creator.published_video_link}
                      views={creator.views}
                      engagementRate={creator.engagement_rate}
                      notes={getMockNotes(creator.id)}
                      onAddNote={(content, isInternal) => {
                        console.log(`Added note to ${creator.creator_name}: ${content}`);
                      }}
                      onApprove={() => {
                        console.log(`Approved video for ${creator.creator_name}`);
                      }}
                      onRevisions={() => {
                        console.log(`Requested revisions for ${creator.creator_name}`);
                      }}
                      userRole={profile?.role || 'client'}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
             <span className="w-2 h-6 bg-yellow-400 rounded-full"></span> Pending Action
          </h2>
           {pendingCreators.map(creator => (
             <div key={creator.id} className="bg-yellow-950/20 border border-yellow-500/20 p-5 rounded-xl">
               <p className="font-bold text-yellow-500">{creator.creator_name}</p>
               <p className="text-xs text-neutral-400 mt-1 mb-4">{creator.deliverable}</p>
               <button className="w-full py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-lg hover:bg-yellow-400">Review Now</button>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
