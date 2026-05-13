'use client';

import CalendarView from '@/components/CalendarView';

export default function CalendarWrapper({ events }: { events: any[] }) {
  return <CalendarView events={events} />;
}