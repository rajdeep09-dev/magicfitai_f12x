import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'client';
  first_name: string;
  company_name?: string;
  avatar_url?: string;
  is_active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setLoading(false);
          return;
        }
        setUser(user);

        // Fetch FRESH profile data
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
      } catch (err) {
        console.error('Error fetching auth:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuth();
  }, []);

  return {
    user,
    profile,
    loading,
    isEditor: profile?.role === 'editor' || profile?.role === 'admin',
    isClient: profile?.role === 'client',
    logout: async () => { await supabase.auth.signOut(); router.push('/auth/login'); }
  };
}
