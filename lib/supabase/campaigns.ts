import { createClient } from './client';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'paused' | 'completed';
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function getCampaigns(options?: {
  status?: string;
}): Promise<Campaign[]> {
  try {
    const supabase = supabase;
    console.log('[v0] Fetching campaigns from Supabase');
    
    let query = supabase.from('campaigns').select('*');

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Error fetching campaigns:', error);
      return [];
    }

    console.log(`[v0] Successfully loaded ${data?.length || 0} campaigns`);
    return data || [];
  } catch (error) {
    console.error('[v0] Error in getCampaigns:', error);
    return [];
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const supabase = supabase;
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[v0] Error fetching campaign:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in getCampaignById:', error);
    return null;
  }
}
