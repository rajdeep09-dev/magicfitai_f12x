'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'deadline' | 'approval' | 'published' | 'revision';
  creator?: string;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
}

const EVENT_COLORS: Record<string, string> = {
  deadline: 'bg-yellow-500/20 border-yellow-600 text-yellow-300',
  approval: 'bg-blue-500/20 border-blue-600 text-blue-300',
  published: 'bg-lime-500/20 border-lime-600 text-lime-300',
  revision: 'bg-orange-500/20 border-orange-600 text-orange-300',
};

export default function CalendarView({ events = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.date.startsWith(dateStr));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-50">{monthYear}</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition"
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-neutral-800 border-b border-neutral-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-neutral-800 p-3 text-center">
              <p className="text-xs font-semibold text-neutral-400">{day}</p>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-neutral-800 p-px">
          {/* Empty cells for days before the month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-neutral-900 h-24" />
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (firstDay + day) * 0.01 }}
                className={`bg-neutral-900 h-24 p-2 border border-neutral-800 transition hover:bg-neutral-800/50 ${
                  isToday ? 'ring-2 ring-lime-400' : ''
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-lime-400' : 'text-neutral-50'
                  }`}
                >
                  {day}
                </p>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-xs p-1 rounded border ${EVENT_COLORS[event.type]} truncate`}
                      title={event.title}
                    >
                      {event.title}
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-neutral-500 px-1">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Empty cells for days after the month ends */}
          {Array.from({ length: 42 - firstDay - daysInMonth }).map((_, i) => (
            <div key={`empty-after-${i}`} className="bg-neutral-900/50 h-24" />
          ))}
        </div>
      </div>

      {/* Event Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(EVENT_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border ${colors}`} />
            <span className="text-xs text-neutral-400 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
