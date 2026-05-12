'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Creator } from '@/types/creator';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('creators').select('*');
        if (error) throw error;
        setCreators(data || []);
      } catch (err: any) {
        console.error('Failed to load creators:', err);
        setError(err.message || 'Failed to load creators');
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">Error: {error}</div>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Creator Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((c) => (
          <div key={c.id} className="bg-neutral-900 border border-white/10 p-5 rounded-xl">
            <h2 className="text-xl font-bold">{c.creator_name}</h2>
            <p className="text-sm text-neutral-400">{c.platform}</p>
            <p className="text-lime-400 mt-2 font-bold">${c.base_price?.toFixed(2) || '0.00'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}