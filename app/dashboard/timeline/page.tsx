'use client';

import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

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
  const startDate = '2026-05-01';
  const endDate = '2026-08-31';

  const sortedCreators = [...mockCreators].sort((a, b) => {
    if (!a.live_date || !b.live_date) return 0;
    return new Date(a.live_date).getTime() - new Date(b.live_date).getTime();
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Campaign Timeline</h1>
          <p className="text-neutral-400">
            Gantt view of your campaign showing delivery dates, approvals, and milestones.
          </p>
        </div>

        {/* Timeline Legend */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-50 mb-3">Status Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-neutral-400">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Gantt Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="bg-neutral-800/50 border-b border-neutral-700 p-4 flex gap-4 sticky top-0 z-10">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-semibold text-neutral-50">Creator</p>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <div className="text-xs text-neutral-400 font-medium">May</div>
                    <div className="text-xs text-neutral-400 font-medium">Jun</div>
                    <div className="text-xs text-neutral-400 font-medium">Jul</div>
                    <div className="text-xs text-neutral-400 font-medium">Aug</div>
                  </div>
                </div>
              </div>

              {/* Timeline Rows */}
              <div className="space-y-2 p-4">
                {sortedCreators.map((creator, idx) => {
                  const daysUntil = creator.live_date ? getDaysUntil(creator.live_date) : null;
                  const isUpcoming = daysUntil !== null && daysUntil > 0;

                  return (
                    <motion.div
                      key={creator.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-4 items-center group hover:bg-neutral-800/30 p-2 rounded transition"
                    >
                      {/* Creator Name */}
                      <div className="w-40 flex-shrink-0">
                        <p className="text-sm font-medium text-neutral-50 truncate">
                          {creator.creator_name}
                        </p>
                        <p className="text-xs text-neutral-500">{creator.platform}</p>
                      </div>

                      {/* Gantt Bar */}
                      <div className="flex-1 h-10 bg-neutral-800/30 rounded relative overflow-hidden group">
                        {/* Status Bar */}
                        <div
                          className={`h-full ${STATUS_COLORS[creator.approval_status]} opacity-70 group-hover:opacity-90 transition flex items-center px-2`}
                          style={{ width: `${Math.max(5, (creator.progress_score / 100) * 100)}%` }}
                        >
                          {creator.progress_score > 20 && (
                            <span className="text-xs font-semibold text-neutral-950 whitespace-nowrap">
                              {creator.progress_score}%
                            </span>
                          )}
                        </div>

                        {/* Target Date Marker */}
                        {creator.live_date && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-lime-400 opacity-50"
                            style={{ left: `${getProgressPercentage(startDate, endDate)}%` }}
                          />
                        )}
                      </div>

                      {/* Date Info */}
                      <div className="w-32 text-right flex-shrink-0">
                        <p className="text-xs text-neutral-400">
                          {creator.live_date ? getMonthYear(creator.live_date) : 'TBD'}
                        </p>
                        {isUpcoming && (
                          <p className="text-xs text-yellow-400 font-medium flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysUntil}d away
                          </p>
                        )}
                        {creator.approval_status === 'Published' && (
                          <p className="text-xs text-lime-400 font-medium flex items-center justify-end gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Published
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4">Key Milestones</h2>
          <div className="space-y-3">
            {[
              {
                date: '2026-05-15',
                title: 'First Wave Launch',
                description: '@fitness_sarah and @instagram_coach_james go live',
                icon: CheckCircle,
              },
              {
                date: '2026-06-01',
                title: 'Mid-Campaign Review',
                description: 'Evaluate performance, plan adjustments',
                icon: AlertCircle,
              },
              {
                date: '2026-08-31',
                title: 'Campaign Completion',
                description: 'All creators published, final analysis',
                icon: CheckCircle,
              },
            ].map((milestone, idx) => {
              const Icon = milestone.icon;
              const isPast = new Date(milestone.date) < new Date();

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className={`flex gap-4 p-4 rounded-lg border ${
                    isPast
                      ? 'bg-lime-900/20 border-lime-700'
                      : 'bg-yellow-900/20 border-yellow-700'
                  }`}
                >
                  <div className="flex-shrink-0 pt-1">
                    <Icon className={`w-5 h-5 ${isPast ? 'text-lime-400' : 'text-yellow-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isPast ? 'text-lime-400' : 'text-yellow-400'}`}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{milestone.description}</p>
                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date(milestone.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
