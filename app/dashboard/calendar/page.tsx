'use client';

import { motion } from 'framer-motion';
import CalendarView from '@/components/CalendarView';

const generateCalendarEvents = () => {
  const events: any[] = [];

  mockCreators.forEach((creator) => {
    // Add live date event
    if (creator.live_date) {
      events.push({
        id: `${creator.id}-live`,
        date: creator.live_date,
        title: `${creator.creator_name.replace('@', '')} Goes Live`,
        type: 'live',
        creator: creator.creator_name,
      });
    }

    // Add approval event
    if (creator.approval_status === 'Video Pending Approval') {
      const approvalDate = new Date(creator.live_date || new Date());
      approvalDate.setDate(approvalDate.getDate() - 3);
      events.push({
        id: `${creator.id}-approval`,
        date: approvalDate.toISOString().split('T')[0],
        title: `${creator.creator_name.replace('@', '')} Review`,
        type: 'approval',
        creator: creator.creator_name,
      });
    }

    // Add published event
    if (creator.approval_status === 'Published' && creator.live_date) {
      events.push({
        id: `${creator.id}-published`,
        date: creator.live_date,
        title: `${creator.creator_name.replace('@', '')} Live`,
        type: 'published',
        creator: creator.creator_name,
      });
    }
  });

  return events;
};

export default function CalendarPage() {
  const events = generateCalendarEvents();

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
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Campaign Calendar</h1>
          <p className="text-neutral-400">
            View all your campaign milestones, deadlines, and publishing dates.
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6">
          <CalendarView events={events} />
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-50 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events
              .filter((e) => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 10)
              .map((event, idx) => {
                const eventDate = new Date(event.date);
                const daysAway = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                const typeColor: Record<string, string> = {
                  deadline: 'text-yellow-400 bg-yellow-900/20',
                  approval: 'text-blue-400 bg-blue-900/20',
                  published: 'text-lime-400 bg-lime-900/20',
                  revision: 'text-orange-400 bg-orange-900/20',
                };

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-700 hover:bg-neutral-800/30 transition"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-50">{event.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {eventDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColor[event.type]}`}>
                      {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}
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
