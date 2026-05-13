'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, DollarSign, Activity, Copy, Check } from 'lucide-react';

export default function ReportsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [progressItems, setProgressItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'editor'|'client'|null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'handle', direction: 'asc' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (data) setUserRole(data.role as 'editor' | 'client');
        }

        const [creatorsRes, budgetRes, progressRes] = await Promise.all([
          supabase.from('creators').select('*'),
          supabase.from('campaign_budget').select('*'),
          supabase.from('creator_progress').select('*')
        ]);

        if (creatorsRes.error) throw creatorsRes.error;
        if (budgetRes.error) throw budgetRes.error;
        if (progressRes.error) throw progressRes.error;

        setCreators(creatorsRes.data || []);
        setBudgetItems(budgetRes.data || []);
        setProgressItems(progressRes.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center animate-pulse">Loading Reports...</div>;
  if (error) return <div className="p-8 text-red-400 font-bold bg-[#050505] min-h-screen">Error: {error}</div>;

  // METRICS
  const approvedCreators = creators.filter(c => c.approval_status === 'Approved' || c.approval_status === 'Signed');
  const estReach = approvedCreators.reduce((sum, c) => sum + (c.followers || 0), 0);
  
  const totalAllocated = budgetItems.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalSpent = budgetItems.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // FUNNEL
  const funnelStages = ['Sourced', 'Outreach', 'Negotiating', 'Signed', 'Approved'];
  const maxInFunnel = Math.max(...funnelStages.map(s => creators.filter(c => c.approval_status === s).length), 1);

  // PROGRESS TABLE
  const tableData = approvedCreators.map(c => {
    const prog = progressItems.find(p => p.creator_id === c.id);
    return {
      id: c.id,
      handle: c.handle,
      platform: c.platform || 'N/A',
      followers: c.followers || 0,
      stage: prog ? prog.stage : 'Brief Sent',
      updated_at: prog ? new Date(prog.updated_at) : new Date(c.created_at)
    };
  });

  const sortedTableData = [...tableData].sort((a, b) => {
    if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const text = `
CAMPAIGN SUMMARY REPORT
-----------------------
Total Pipeline: ${creators.length}
Approved Creators: ${approvedCreators.length}
Est Reach: ${estReach.toLocaleString()}
Budget Utilized: ${budgetUtilization.toFixed(1)}%

APPROVED ROSTER:
${sortedTableData.map(d => `- @${d.handle} (${d.platform}): ${d.followers.toLocaleString()} followers | Stage: ${d.stage}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Campaign Reports</h1>
        {userRole === 'editor' && (
          <button onClick={handleExport} className="bg-neutral-900 border border-white/10 hover:border-lime-400 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded flex items-center gap-2 transition">
            {copied ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Export Summary'}
          </button>
        )}
      </div>

      {/* HEADLINE METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><Users className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Total</span></div>
          <p className="text-2xl font-black">{creators.length}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><Check className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Approved</span></div>
          <p className="text-2xl font-black text-lime-400">{approvedCreators.length}</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><DollarSign className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Budget Used</span></div>
          <p className="text-2xl font-black">{budgetUtilization.toFixed(1)}%</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-neutral-500 mb-2"><Activity className="w-4 h-4"/> <span className="text-[10px] font-black uppercase tracking-widest">Est Reach</span></div>
          <p className="text-2xl font-black text-blue-400">{(estReach / 1000000).toFixed(2)}M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* PIPELINE FUNNEL */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Pipeline Funnel</h2>
          <div className="space-y-4">
            {funnelStages.map(stage => {
              const count = creators.filter(c => c.approval_status === stage).length;
              const pct = Math.max((count / maxInFunnel) * 100, 5); // minimum 5% for visibility if count > 0
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-24 text-[10px] font-black uppercase tracking-widest text-right shrink-0">{stage}</div>
                  <div className="flex-1 h-6 bg-neutral-950 rounded overflow-hidden">
                    <div className="h-full bg-lime-400" style={{ width: count === 0 ? '0%' : `${pct}%` }} />
                  </div>
                  <div className="w-8 text-sm font-bold text-lime-400">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUDGET BREAKDOWN */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 overflow-x-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Budget Breakdown</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/10">
                <th className="pb-2">Label</th>
                <th className="pb-2 text-right">Allocated</th>
                <th className="pb-2 text-right">Spent</th>
                <th className="pb-2 text-right">Rem</th>
                <th className="pb-2 text-right">% Used</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map(item => {
                const a = Number(item.amount);
                const s = Number(item.spent);
                const rem = a - s;
                const pct = a > 0 ? (s / a) * 100 : 0;
                let pctColor = 'text-lime-400';
                if (pct >= 50 && pct <= 80) pctColor = 'text-yellow-400';
                if (pct > 80) pctColor = 'text-red-400';

                return (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-2 font-bold">{item.label}</td>
                    <td className="py-2 text-right">${a.toLocaleString()}</td>
                    <td className="py-2 text-right">${s.toLocaleString()}</td>
                    <td className="py-2 text-right">${rem.toLocaleString()}</td>
                    <td className={`py-2 text-right font-black ${pctColor}`}>{pct.toFixed(0)}%</td>
                  </tr>
                )
              })}
              {budgetItems.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-xs text-neutral-500">No budget items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATOR PROGRESS TABLE */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Approved Creator Progress</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/10 cursor-pointer">
              <th className="pb-2 hover:text-white transition" onClick={() => handleSort('handle')}>Handle {sortConfig.key === 'handle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 hover:text-white transition" onClick={() => handleSort('platform')}>Platform {sortConfig.key === 'platform' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 text-right hover:text-white transition" onClick={() => handleSort('followers')}>Followers {sortConfig.key === 'followers' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 hover:text-white transition pl-4" onClick={() => handleSort('stage')}>Content Stage {sortConfig.key === 'stage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 text-right hover:text-white transition" onClick={() => handleSort('updated_at')}>Last Updated {sortConfig.key === 'updated_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTableData.map(row => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 font-bold">@{(row.handle ?? '').replace(/^@/, '')}</td>
                <td className="py-3"><span className="text-[9px] uppercase border border-neutral-700 px-1.5 py-0.5 rounded">{row.platform}</span></td>
                <td className="py-3 text-right font-mono text-xs">{row.followers.toLocaleString()}</td>
                <td className="py-3 pl-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{row.stage}</span>
                </td>
                <td className="py-3 text-right text-xs text-neutral-400">{row.updated_at.toLocaleDateString()}</td>
              </tr>
            ))}
            {sortedTableData.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-xs text-neutral-500 uppercase tracking-widest">No approved creators yet.</td></tr>}
          </tbody>
        </table>
      </div>

    </div>
  );
}
