import { createClient } from './client';

export interface Payout {
  id: string;
  creator_id: string;
  campaign_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'hold';
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPayouts(options?: {
  creatorId?: string;
  campaignId?: string;
  status?: string;
}): Promise<Payout[]> {
  try {
    const supabase = createClient();
    console.log('[v0] Fetching payouts from Supabase');
    
    let query = supabase.from('payouts').select('*');

    if (options?.creatorId) {
      query = query.eq('creator_id', options.creatorId);
    }
    if (options?.campaignId) {
      query = query.eq('campaign_id', options.campaignId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Error fetching payouts:', error);
      return [];
    }

    console.log(`[v0] Successfully loaded ${data?.length || 0} payouts`);
    return data || [];
  } catch (error) {
    console.error('[v0] Error in getPayouts:', error);
    return [];
  }
}

export async function updatePayoutStatus(
  payoutId: string,
  status: 'pending' | 'processing' | 'paid' | 'hold'
): Promise<Payout | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payouts')
      .update({ status, paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null })
      .eq('id', payoutId)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating payout:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in updatePayoutStatus:', error);
    return null;
  }
}
