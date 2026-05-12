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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setUser(user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // If profile fetch fails, we still set loading to false so the UI doesn't hang
        } else {
          setProfile(profileData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error getting user:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };

    // Add a safety timeout to force stop loading if auth hangs
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timed out, forcing stop');
        setLoading(false);
      }
    }, 5000);

    getUser();

    // Subscribe to auth changes and fetch profile on login/refresh
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
        setUser(session.user);
        // Force re-fetch profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        if (profileData) setProfile(profileData);
        } else {
        setUser(null);
        setProfile(null);
        }
    });

    return () => {
        subscription?.unsubscribe();
        clearTimeout(timeout);
    };
    }, [supabase]);

    return {
    user,
    profile,
    loading,
    error,
    logout,
    isAdmin: profile?.role === 'admin',
    isEditor: profile?.role === 'editor', // Strict match
    isClient: profile?.role === 'client', // Strict match
    };
    }
}
