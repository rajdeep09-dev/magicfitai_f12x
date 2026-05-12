'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Play, ExternalLink } from 'lucide-react';
import NotesThread from './NotesThread';

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
  onApprove?: () => void;
  onRevisions?: () => void;
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
  const isPublished = approvalStatus === 'Published';
  const isPending = approvalStatus === 'Video Pending Approval';
  const isClient = userRole === 'client';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-neutral-700 p-4 bg-neutral-800/20 space-y-6"
    >
      {/* Video Links Section */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-50 mb-3">Video Content</h4>
        <div className="space-y-2">
          {videoLink && (
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <Play className="w-5 h-5 text-lime-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 font-medium mb-2">
                    {isPublished ? 'Published Video' : 'Draft Video (Unlisted)'}
                  </p>
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lime-400 hover:text-lime-300 text-sm font-medium break-all flex items-center gap-2 group"
                  >
                    {videoLink}
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {publishedVideoLink && publishedVideoLink !== videoLink && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-400 font-medium mb-2">Published on Live Platform</p>
                  <a
                    href={publishedVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm font-medium break-all flex items-center gap-2 group"
                  >
                    {publishedVideoLink}
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {!videoLink && !publishedVideoLink && (
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4 text-center">
              <p className="text-sm text-neutral-400 italic">No video link available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats (only for published videos) */}
      {isPublished && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-sm font-semibold text-neutral-50 mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-700">
              <p className="text-xs text-neutral-400 mb-1">Views</p>
              <p className="text-2xl font-bold text-lime-400">{views.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-1">total reach</p>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-700">
              <p className="text-xs text-neutral-400 mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-pink-400">{engagementRate}%</p>
              <p className="text-xs text-neutral-500 mt-1">likes + comments</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Approval Status Section */}
      {isPending && isClient && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-yellow-400 mb-1">Ready for Your Review</h5>
              <p className="text-sm text-yellow-300">
                Please review the video above and either approve it or request revisions using the notes section below.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes & Comments Section */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-50 mb-3">Comments & Feedback</h4>
        <NotesThread
          creatorId={creatorId}
          creatorName={creatorName}
          notes={notes}
          onAddNote={onAddNote}
          userRole={userRole}
        />
      </div>

      {/* Action Buttons for Pending Videos */}
      {isPending && isClient && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 pt-4 border-t border-neutral-700"
        >
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Approve Video
          </button>
          <button
            onClick={onRevisions}
            className="flex-1 px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600 text-orange-400 font-semibold rounded-lg transition"
          >
            Request Revisions
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
