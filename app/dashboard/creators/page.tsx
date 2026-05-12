'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      console.log("Fetching data from Supabase...");
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('creators').select('*');
        
        console.log("Supabase response:", { data, error });
        
        if (error) {
          console.error("Supabase Error:", error);
          setError(error.message);
        } else {
          console.log("Data received:", data);
          setCreators(data || []);
        }
      } catch (e: any) {
        console.error("Unexpected error:", e);
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
      {creators && creators.length > 0 ? (
        <pre className="bg-neutral-900 p-4 rounded">{JSON.stringify(creators, null, 2)}</pre>
      ) : (
        <p>No creators found.</p>
      )}
    </div>
  );
}