'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreatorsPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        console.log("Fetching data from Supabase...");
        const { data: result, error } = await supabase.from('creators').select('*');
        if (error) throw error;
        setData(result);
      } catch (e: any) {
        console.error("DEBUG ERROR:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading data...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold mb-5">Creators</h1>
      {data && data.length > 0 ? (
        <pre className="bg-neutral-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No creators found.</p>
      )}
    </div>
  );
}