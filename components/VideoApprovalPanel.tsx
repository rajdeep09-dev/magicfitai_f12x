'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Play, ExternalLink, Loader2 } from 'lucide-react';
import NotesThread from './NotesThread';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  author_name: string;
  author_role: 'client' | 'editor';
  content: string;
  is_internal: boolean;
  created_at: string;
}

interface VideoApprovalPanelProps {
  creatorName: string;
  creatorId: string;
  approvalStatus: string;
  videoLink: string | null;
  publishedVideoLink: string | null;
  views: number;
  engagementRate: number;
  notes: Note[];
  onAddNote: (content: string, isInternal: boolean) => void;
  onApprove: () => void;
  onRevisions: () => void;
  userRole: 'client' | 'editor';
}

export default function VideoApprovalPanel({
  creatorName,
  creatorId,
  approvalStatus,
  videoLink,
  publishedVideoLink,
  views,
  engagementRate,
  notes,
  onAddNote,
  onApprove,
  onRevisions,
  userRole,
}: VideoApprovalPanelProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'revision') => {
    setLoadingAction(action);
    try {
      const response = await fetch('/api/creators/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, action }),
      });
      const data = await response.json();
      if (response.ok) {
        if (action === 'approve') onApprove();
        else onRevisions();
        // Force router update and UI refresh
        router.refresh(); 
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (e) {
      console.error(e);
      alert('Network error, please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const isPending = approvalStatus === 'Video Pending Approval';
  const isClient = userRole === 'client';
  const isEditor = userRole === 'editor';

  // Toggle recommendation handler
  const handleToggleRecommend = async () => {
    // Optimistic state toggle
    const newStatus = !isRecommended; 
    await fetch('/api/creators/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, action: 'toggle_recommend', isRecommended: newStatus }),
    });
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/5 p-6 bg-neutral-950/50 space-y-6"
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between">
         <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500">Action Center</h4>
         {isRecommended && (
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle className="w-3 h-3" /> F12X Recommended
           </div>
         )}
      </div>

      {/* Video Preview */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition">
        <a 
          href={videoLink || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-lime-400 font-bold hover:text-lime-300 transition"
        >
          <div className="w-8 h-8 rounded-full bg-lime-400/10 flex items-center justify-center">
             <Play className="w-4 h-4" />
          </div>
          Watch Draft Video
        </a>
      </div>

      {/* Action Zone */}
      <div className="grid grid-cols-2 gap-3">
        {isClient && isPending && (
          <>
            <button 
              onClick={() => handleAction('approve')}
              disabled={!!loadingAction}
              className="bg-lime-400 hover:bg-lime-300 text-neutral-950 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition"
            >
              Approve
            </button>
            <button 
              onClick={() => handleAction('revision')}
              disabled={!!loadingAction}
              className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition border border-white/5"
            >
              Request Changes
            </button>
          </>
        )}
        {isEditor && (
          <button 
            onClick={handleToggleRecommend}
            className="col-span-2 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest border border-white/5 transition"
          >
            {isRecommended ? 'Remove Recommendation' : 'Recommend Creator'}
          </button>
        )}
      </div>

      <NotesThread 
          creatorId={creatorId}
          creatorName={creatorName}
          notes={remoteNotes}
          onAddNote={handleAddNote}
          userRole={userRole}
      />
    </motion.div>
  );
}
