import { createBrowserClient } from '@supabase/ssr'

// Use globalThis to persist the client instance across hot reloads in development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing!');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
