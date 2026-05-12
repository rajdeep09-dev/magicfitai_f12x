'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Play, Loader2 } from 'lucide-react';
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
      if (response.ok) {
        if (action === 'approve') onApprove();
        else onRevisions();
        router.refresh(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const isPending = approvalStatus === 'Video Pending Approval';
  const isClient = userRole === 'client';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/5 p-6 bg-neutral-950/50 space-y-6"
    >
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
      {isClient && isPending && (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction('approve')}
            disabled={!!loadingAction}
            className="bg-lime-400 hover:bg-lime-300 text-neutral-950 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition"
          >
            {loadingAction === 'approve' ? <Loader2 className="animate-spin" /> : 'Approve'}
          </button>
          <button 
            onClick={() => handleAction('revision')}
            disabled={!!loadingAction}
            className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition border border-white/5"
          >
            {loadingAction === 'revision' ? <Loader2 className="animate-spin" /> : 'Request Changes'}
          </button>
        </div>
      )}

      <NotesThread 
          creatorId={creatorId}
          creatorName={creatorName}
          notes={notes}
          onAddNote={onAddNote}
          userRole={userRole}
      />
    </motion.div>
  );
}
