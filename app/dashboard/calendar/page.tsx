'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { creators, isEditor } = useCampaign() as any; // Mocking isEditor if not in context, I should get it from useAuth
  const [userRole, setUserRole] = useState<'editor'|'client'|null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'deadline', creator_id: '', notes: '' });
  
  // Actually, I should use useAuth to get role. Let's do that cleanly.
  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (data) setUserRole(data.role as 'editor' | 'client');
        }
        
        const { data: eventsData, error: eventsError } = await supabase.from('campaign_events').select('*, creators(handle)');
        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load calendar');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) return <div className="p-8 text-lime-400 font-black tracking-widest uppercase text-xs bg-[#050505] min-h-screen flex items-center justify-center animate-pulse">Loading Calendar...</div>;
  if (error) return <div className="p-8 text-red-400 font-bold bg-[#050505] min-h-screen">Error: {error}</div>;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-400';
      case 'shoot': return 'bg-blue-400';
      case 'review': return 'bg-yellow-400';
      case 'publish': return 'bg-lime-400';
      default: return 'bg-neutral-500';
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    try {
      const supabase = createClient();
      // Format date as YYYY-MM-DD
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      const { data, error } = await supabase.from('campaign_events').insert([{
        title: formData.title,
        date: dateStr,
        type: formData.type,
        creator_id: formData.creator_id || null,
        notes: formData.notes
      }]).select('*, creators(handle)').single();
      
      if (error) throw error;
      
      setEvents(prev => [...prev, data]);
      setShowAddForm(false);
      setFormData({ title: '', type: 'deadline', creator_id: '', notes: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const selectedDateEvents = selectedDate 
    ? events.filter(ev => {
        const evDate = new Date(ev.date);
        return evDate.getUTCFullYear() === selectedDate.getFullYear() && 
               evDate.getUTCMonth() === selectedDate.getMonth() && 
               evDate.getUTCDate() === selectedDate.getDate();
      })
    : [];

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-neutral-900 border border-white/10 rounded hover:border-lime-400 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 bg-neutral-900 border border-white/10 rounded hover:border-lime-400 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="aspect-square bg-neutral-900/20 rounded-xl border border-white/5 opacity-50" />
          ))}
          {days.map(day => {
            const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
            const dayEvents = events.filter(ev => {
              const evDate = new Date(ev.date);
              return evDate.getUTCFullYear() === thisDate.getFullYear() && 
                     evDate.getUTCMonth() === thisDate.getMonth() && 
                     evDate.getUTCDate() === thisDate.getDate();
            });

            return (
              <div 
                key={day} 
                onClick={() => { setSelectedDate(thisDate); setShowAddForm(false); }}
                className={`aspect-square bg-neutral-900 rounded-xl border p-2 cursor-pointer transition flex flex-col ${isSelected ? 'border-lime-400 bg-lime-400/10' : 'border-white/10 hover:border-white/30'}`}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-lime-400' : 'text-neutral-400'}`}>{day}</span>
                <div className="flex gap-1 mt-auto flex-wrap">
                  {dayEvents.slice(0,3).map(ev => (
                    <div key={ev.id} className={`w-2 h-2 rounded-full ${getTypeColor(ev.type)}`} />
                  ))}
                  {dayEvents.length > 3 && <span className="text-[8px] text-neutral-500">+{dayEvents.length - 3}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIDE PANEL */}
      <div className="w-full md:w-80 bg-neutral-900 rounded-xl border border-white/10 p-6 shrink-0 h-fit sticky top-24">
        {selectedDate ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-lime-400">
                {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </h2>
              {userRole === 'editor' && !showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="p-1 hover:bg-white/10 rounded transition">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {showAddForm ? (
              <form onSubmit={handleAddEvent} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Add Event</span>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4"/></button>
                </div>
                
                <input 
                  type="text" required placeholder="Event Title"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400"
                />
                
                <select 
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400"
                >
                  <option value="deadline">Deadline (Red)</option>
                  <option value="shoot">Shoot (Blue)</option>
                  <option value="review">Review (Yellow)</option>
                  <option value="publish">Publish (Lime)</option>
                </select>

                <select 
                  value={formData.creator_id} onChange={e => setFormData({...formData, creator_id: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400"
                >
                  <option value="">No Creator</option>
                  {creators.map(c => (
                    <option key={c.id} value={c.id}>@{c.handle}</option>
                  ))}
                </select>

                <textarea 
                  placeholder="Notes..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded p-2 text-sm outline-none focus:border-lime-400 h-20 resize-none"
                />

                <button type="submit" className="w-full bg-lime-400 text-black font-black uppercase text-xs px-4 py-2 rounded hover:bg-lime-300 transition-colors">
                  Save Event
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-neutral-500 text-sm italic">No events scheduled.</p>
                ) : (
                  selectedDateEvents.map(ev => (
                    <div key={ev.id} className="bg-[#050505] border border-white/5 p-4 rounded-lg flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm">{ev.title}</span>
                        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${getTypeColor(ev.type)}`} />
                      </div>
                      {ev.creators && (
                        <span className="text-xs text-neutral-400">@{ev.creators.handle}</span>
                      )}
                      {ev.notes && (
                        <p className="text-[10px] text-neutral-500 mt-2 bg-neutral-900 p-2 rounded">{ev.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-neutral-600 text-xs uppercase tracking-widest">
            Select a date to view events
          </div>
        )}
      </div>
    </div>
  );
}
