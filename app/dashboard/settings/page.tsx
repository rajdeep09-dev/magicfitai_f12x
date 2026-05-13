'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'editor'|'client'|null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  const [newUser, setNewUser] = useState({ first_name: '', email: '', role: 'client', company_name: '' });
  const [savingUser, setSavingUser] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const [budgetLabel, setBudgetLabel] = useState('Summer 2026 Launch');
  const [budgetAmount, setBudgetAmount] = useState(5000);
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/auth/login');
            return;
        }
        
        setCurrentUserId(session.user.id);
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (prof) {
            setUserRole(prof.role);
            if (prof.role !== 'editor' && prof.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
        }

        const [pRes, bRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('is_active', true),
          supabase.from('campaign_budget').select('*').limit(1).single()
        ]);

        if (pRes.data) setProfiles(pRes.data);
        if (bRes.data) {
            setBudgetItems([bRes.data]);
            setBudgetLabel(bRes.data.label);
            setBudgetAmount(Number(bRes.data.amount));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const toggleActive = async (id: string, current: boolean) => {
    if (id === currentUserId) return; // Can't disable self
    try {
        const supabase = createClient();
        await supabase.from('profiles').update({ is_active: !current }).eq('id', id);
        setProfiles(profiles.map(p => p.id === id ? { ...p, is_active: !current } : p));
    } catch (e) {
        console.error(e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingUser(true);
      setUserMsg('');
      try {
          const supabase = createClient();
          // We don't have their auth.users id because they haven't signed up.
          // In a real app we'd invite them. Here we just show the message as requested.
          setUserMsg(`User added. Send them the sign-up link manually to ${newUser.email}`);
          setNewUser({ first_name: '', email: '', role: 'client', company_name: '' });
      } catch (e) {
          console.error(e);
      } finally {
          setSavingUser(false);
      }
  };

  const handleSaveBudget = async () => {
      setSavingBudget(true);
      try {
          const supabase = createClient();
          if (budgetItems.length > 0) {
              await supabase.from('campaign_budget').update({ label: budgetLabel, amount: budgetAmount }).eq('id', budgetItems[0].id);
          } else {
              await supabase.from('campaign_budget').insert([{ label: budgetLabel, amount: budgetAmount, spent: 0 }]);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setSavingBudget(false);
      }
  };

  if (loading) return <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center animate-pulse">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white font-sans">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TEAM MEMBERS */}
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest mb-6">Team Members</h2>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead>
                          <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/10">
                              <th className="pb-2">Name</th>
                              <th className="pb-2">Email</th>
                              <th className="pb-2">Role</th>
                              <th className="pb-2 text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {profiles.map(p => (
                              <tr key={p.id} className="border-b border-white/5">
                                  <td className="py-3 font-bold">{p.first_name}</td>
                                  <td className="py-3 text-neutral-400 text-xs">{p.email}</td>
                                  <td className="py-3">
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                          p.role === 'admin' ? 'border-purple-500/50 text-purple-400' :
                                          p.role === 'editor' ? 'border-lime-500/50 text-lime-400' :
                                          'border-blue-500/50 text-blue-400'
                                      }`}>
                                          {p.role}
                                      </span>
                                  </td>
                                  <td className="py-3 text-right">
                                      <button 
                                        disabled={p.id === currentUserId}
                                        onClick={() => toggleActive(p.id, p.is_active)}
                                        className={`text-[9px] font-black uppercase px-2 py-1 rounded transition ${p.is_active ? 'bg-lime-400/20 text-lime-400 hover:bg-lime-400/30' : 'bg-red-400/20 text-red-400 hover:bg-red-400/30'} disabled:opacity-50`}
                                      >
                                          {p.is_active ? 'Active' : 'Inactive'}
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="space-y-8">
              {/* CAMPAIGN SETTINGS */}
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-6">Campaign Config</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Campaign Name</label>
                          <input 
                              type="text" value={budgetLabel} onChange={e => setBudgetLabel(e.target.value)}
                              className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Total Budget Cap ($)</label>
                          <input 
                              type="number" value={budgetAmount} onChange={e => setBudgetAmount(Number(e.target.value))}
                              className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                          />
                      </div>
                      <button onClick={handleSaveBudget} disabled={savingBudget} className="bg-lime-400 hover:bg-lime-300 text-black font-black uppercase text-xs px-4 py-2 rounded transition-colors disabled:opacity-50">
                          {savingBudget ? 'Saving...' : 'Save Settings'}
                      </button>
                  </div>
              </div>

              {/* ADD USER */}
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-6">Invite User</h2>
                  <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">First Name</label>
                              <input 
                                  required type="text" value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Email</label>
                              <input 
                                  required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Role</label>
                              <select 
                                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                              >
                                  <option value="client">Client</option>
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Company</label>
                              <input 
                                  type="text" value={newUser.company_name} onChange={e => setNewUser({...newUser, company_name: e.target.value})}
                                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 text-white"
                              />
                          </div>
                      </div>
                      <button type="submit" disabled={savingUser} className="bg-lime-400 hover:bg-lime-300 text-black font-black uppercase text-xs px-4 py-2 rounded transition-colors disabled:opacity-50">
                          {savingUser ? 'Processing...' : 'Generate Invite'}
                      </button>
                      {userMsg && <p className="text-lime-400 text-xs font-bold mt-2">{userMsg}</p>}
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
}
