'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock } from 'lucide-react';

interface Note {
  id: string;
  author_name: string;
  author_role: 'client' | 'editor';
  content: string;
  is_internal: boolean;
  created_at: string;
}

interface NotesThreadProps {
  creatorId: string;
  creatorName: string;
  notes: Note[];
  onAddNote: (content: string, isInternal: boolean) => void;
  userRole: 'client' | 'editor';
  isLoading?: boolean;
}

export default function NotesThread({
  creatorId,
  creatorName,
  notes,
  onAddNote,
  userRole,
  isLoading = false,
}: NotesThreadProps) {
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      onAddNote(newNote, isInternal);
      setNewNote('');
      setIsInternal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const visibleNotes = notes.filter((note) => {
    // Show all notes to editors, but hide internal notes from clients
    if (userRole === 'editor') return true;
    return !note.is_internal;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRoleColor = (role: 'client' | 'editor') => {
    return role === 'client' ? 'bg-blue-900/20 border-blue-700' : 'bg-purple-900/20 border-purple-700';
  };

  const getRoleLabel = (role: 'client' | 'editor') => {
    return role === 'client' ? '👤 Client' : '👨‍💼 Editor';
  };

  return (
    <div className="space-y-4">
      {/* Notes History */}
      <div className="max-h-64 overflow-y-auto space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleNotes.length === 0 ? (
            <motion.div
              key="no-notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 text-neutral-500 text-sm italic"
            >
              No notes yet. Start the conversation!
            </motion.div>
          ) : (
            visibleNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-neutral-900/50 border rounded-lg p-3 ${getRoleColor(note.author_role)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getRoleColor(note.author_role)}`}>
                      {getRoleLabel(note.author_role)}
                    </span>
                    <span className="text-xs text-neutral-400">{note.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {note.is_internal && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800/50 border border-neutral-700">
                        <Lock className="w-3 h-3 text-neutral-500" />
                        <span className="text-xs text-neutral-500">Internal</span>
                      </div>
                    )}
                    <span className="text-xs text-neutral-500">{formatDate(note.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">{note.content}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Note Input */}
      <div className="border-t border-neutral-700 pt-4 space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Leave a ${isInternal ? 'private editor ' : ''}note for the creator...`}
          disabled={submitting}
          className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 resize-none disabled:opacity-50"
          rows={2}
        />

        <div className="flex items-center justify-between gap-2">
          {userRole === 'editor' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-600 text-lime-400 focus:ring-lime-400"
              />
              <span className="text-xs text-neutral-400">Private note (editors only)</span>
            </label>
          )}

          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-neutral-950 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Sending...' : 'Send Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
