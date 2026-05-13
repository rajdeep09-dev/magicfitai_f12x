import React, { useEffect, useState } from 'react';

export default function BudgetHistoryFeed({ creatorId }: { creatorId: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch from a 'budget_logs' table
    // For now, we simulate recent budget activity
    setLogs([
        { id: 1, action: 'Budget -$500', note: 'Creator Y Approved' },
        { id: 2, action: 'Budget +$500', note: 'Creator X Rejected' }
    ]);
  }, []);

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 mt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">Budget Activity Log</h3>
        <div className="space-y-4">
            {logs.map(log => (
                <div key={log.id} className="flex justify-between items-center text-sm">
                    <span className={`font-bold ${log.action.includes('+') ? 'text-lime-400' : 'text-red-400'}`}>{log.action}</span>
                    <span className="text-neutral-400 text-xs">{log.note}</span>
                </div>
            ))}
        </div>
    </div>
  );
}