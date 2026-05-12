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
import { mockCreators, getMockNotes } from '@/lib/mock-data';

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
    // Load mock data immediately with smooth transition
    setCreators(mockCreators as Creator[]);
    
    // Ensure minimum 300ms for smooth animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Calculate KPIs with memoization
  const kpis = useMemo(() => {
    const totalCreators = creators.length;
    const pendingApproval = creators.filter(
      (c) => c.approval_status === 'Video Pending Approval'
    ).length;
    const published = creators.filter((c) => c.approval_status === 'Published').length;
    const totalReach = creators.reduce((sum, c) => sum + c.views, 0);
    const avgProgress = totalCreators > 0 
      ? Math.round(creators.reduce((sum, c) => sum + c.progress_score, 0) / totalCreators)
      : 0;
    
    return { totalCreators, pendingApproval, published, totalReach, avgProgress };
  }, [creators]);

  const pendingCreators = useMemo(
    () => creators.filter((c) => c.approval_status === 'Video Pending Approval'),
    [creators]
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published':
        return <CheckCircle className="w-4 h-4" />;
      case 'Video Pending Approval':
        return <Clock className="w-4 h-4" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Revisions Requested':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-neutral-950 px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Hero Section with Circular Progress */}
      <motion.section
        className="mb-12 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-lime-400/20 via-green-500/20 to-lime-400/20 rounded-2xl blur-xl opacity-50"></div>
        <div className="relative bg-neutral-950/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Progress Ring */}
            <motion.div
              className="flex justify-center lg:col-span-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-lime-400 rounded-full blur-2xl opacity-10"></div>
                <ProgressRing percentage={kpis.avgProgress} label="Campaign Progress" size={220} />
              </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
              <KPICard
                icon={Users}
                label="Total Creators Activated"
                value={kpis.totalCreators}
                delay={0.3}
              />
              <KPICard
                icon={Clock}
                label="Content Pending Approval"
                value={kpis.pendingApproval}
                delay={0.4}
              />
              <KPICard
                icon={Play}
                label="Live Content"
                value={kpis.published}
                delay={0.5}
              />
              <KPICard
                icon={TrendingUp}
                label="Estimated Total Reach"
                value={kpis.totalReach.toLocaleString()}
                subtitle="views"
                delay={0.6}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Approval Workflow Board */}
      {pendingCreators && pendingCreators.length > 0 && (
        <motion.section
          className="mb-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400">
              Approval Workflow
            </h2>
            <div className="px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-sm font-semibold shadow-[0_0_10px_rgba(132,204,22,0.2)]">
              {pendingCreators.length} pending
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCreators.map((creator, idx) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                className="bg-neutral-900/60 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-5 hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-neutral-50 text-lg group-hover:text-yellow-100 transition-colors">{creator.creator_name}</p>
                    <p className="text-xs text-yellow-400 font-semibold tracking-wide uppercase mt-1">Ready for Review</p>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-neutral-300 border border-white/10">{creator.platform}</div>
                </div>
                <p className="text-sm text-neutral-400 mb-5 line-clamp-2">{creator.deliverable}</p>
                <a
                  href={creator.video_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-yellow-400/10 hover:bg-yellow-400 text-yellow-400 hover:text-yellow-950 rounded-lg text-sm font-bold transition-all duration-300 border border-yellow-400/30 hover:border-yellow-400 shadow-[inset_0_0_12px_rgba(234,179,8,0.1)] hover:shadow-none"
                >
                  <Play className="w-4 h-4 mr-2" /> Review Draft
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Creator Roster */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10"
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400 mb-6">Creator Roster</h2>
        <div className="space-y-4">
          {creators.map((creator, idx) => {
            const isExpanded = expandedCreator === creator.id;
            const statusColor = STATUS_COLORS[creator.approval_status] || STATUS_COLORS['Ideation'];
            const PlatformIcon = PLATFORM_ICONS[creator.platform];

            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + idx * 0.05 }}
                className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden hover:bg-neutral-900/60 hover:border-lime-400/30 hover:shadow-[0_0_30px_rgba(132,204,22,0.05)] transition-all duration-300 group"
              >
                {/* Creator Card */}
                <button
                  onClick={() => setExpandedCreator(isExpanded ? null : creator.id)}
                  className="w-full text-left focus:outline-none"
                >
                  <div className="p-5 flex items-center gap-5">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-lime-400 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-neutral-950">
                        <PlatformIcon className="w-7 h-7 text-neutral-950" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="font-bold text-neutral-50 text-lg truncate group-hover:text-lime-100 transition-colors">{creator.creator_name}</p>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{creator.platform}</span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate">{creator.deliverable}</p>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${statusColor.bg} ${statusColor.border} shadow-inner`}
                    >
                      {getStatusIcon(creator.approval_status)}
                      <span className={`text-xs font-bold uppercase tracking-wide ${statusColor.text}`}>
                        {creator.approval_status}
                      </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="w-16 text-right flex-shrink-0">
                      <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-lime-300 to-lime-600">{creator.progress_score}%</p>
                    </div>

                    {/* Expand Icon */}
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-lime-400/10 group-hover:border-lime-400/20 transition-colors">
                      <ChevronDown
                        className={`w-5 h-5 text-neutral-400 group-hover:text-lime-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-5 pb-4">
                    <LinearProgress percentage={creator.progress_score} delay={0.7 + idx * 0.05} />
                  </div>
                </button>

                {/* Expanded Section - Video Approval */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-neutral-950/50">
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
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
