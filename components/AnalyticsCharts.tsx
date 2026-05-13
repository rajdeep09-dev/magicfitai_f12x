'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsCharts({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
            <Bar dataKey="views" fill="#AEE078" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}