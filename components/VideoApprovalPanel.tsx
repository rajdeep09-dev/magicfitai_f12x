'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Play, Loader2, FileDown, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

interface VideoApprovalPanelProps {
  creatorName: string;
  creatorId: string;
  approvalStatus: string;
  videoLink: string | null;
  userRole: 'client' | 'editor';
}

export default function VideoApprovalPanel({
  creatorName,
  creatorId,
  approvalStatus,
  videoLink,
  userRole,
}: VideoApprovalPanelProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!creatorId) return null;

  const handleAction = async (action: 'approve' | 'revision') => {
    setLoadingAction(action);
    try {
      const response = await fetch('/api/creators/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, action }),
      });
      if (response.ok) {
        router.refresh(); 
      } else {
        alert('Action failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Revision Requirements: ${creatorName}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Video Link: ${videoLink || 'N/A'}`, 20, 40);
    doc.text(`Status: ${approvalStatus}`, 20, 50);
    doc.save(`Revision_${creatorName}.pdf`);
  };

  const isPending = approvalStatus === 'Video Pending Approval';
  const isClient = userRole === 'client';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/5 p-6 bg-neutral-950/50 space-y-6"
    >
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

      {isClient && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
           <button onClick={generatePDF} className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5">
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
          <a href="mailto:?subject=Revision Request&body=Please address the attached requirements." className="bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 text-center">
            <Mail className="w-4 h-4" /> Send Email
          </a>
        </div>
      )}
    </motion.div>
  );
}