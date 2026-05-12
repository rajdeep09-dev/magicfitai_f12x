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

    // Get user on mount
    getUser();

    // Subscribe to auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);

          // Fetch profile on auth state change
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (err) {
      console.log('[v0] Auth subscription error (expected if Supabase not configured)');
    }
  }, [supabase]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/auth/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out');
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    logout,
    isAdmin: profile?.role === 'admin',
    isEditor: profile?.role === 'editor' || profile?.role === 'admin',
    isClient: profile?.role === 'client',
  };
}
