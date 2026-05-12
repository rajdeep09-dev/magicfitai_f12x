import { createClient } from './client';
import { Creator } from '@/types/creator';

const supabase = createClient();
let creatorsCache: Creator[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache

export async function getCreators(options?: {
  campaignId?: string;
  platform?: string;
  approvalStatus?: string;
  forceRefresh?: boolean;
}): Promise<Creator[]> {
  try {
    // Check cache
    if (!options?.forceRefresh && creatorsCache && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
      console.log('[v0] Returning creators from cache');
      return creatorsCache;
    }

    console.log('[v0] Fetching creators from Supabase');
    
    let query = supabase
      .from('creators')
      .select('*');

    // Apply filters if provided
    if (options?.campaignId) {
      query = query.eq('campaign_id', options.campaignId);
    }
    if (options?.platform) {
      query = query.eq('platform', options.platform);
    }
    if (options?.approvalStatus) {
      query = query.eq('approval_status', options.approvalStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Error fetching creators from Supabase:', error);
      throw error;
    }

    if (!data) {
      console.log('[v0] No creators found');
      return [];
    }

    console.log(`[v0] Successfully loaded ${data.length} creators from Supabase`);
    
    // Update cache
    creatorsCache = data;
    cacheTimestamp = Date.now();

    return data;
  } catch (error) {
    console.error('[v0] Error in getCreators:', error);
    // Return empty array on error - UI should handle gracefully
    return [];
  }
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[v0] Error fetching creator:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in getCreatorById:', error);
    return null;
  }
}

export async function createCreator(creator: Omit<Creator, 'id' | 'created_at' | 'updated_at'>): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .insert([creator])
      .select()
      .single();

    if (error) {
      console.error('[v0] Error creating creator:', error);
      return null;
    }

    // Invalidate cache
    creatorsCache = null;

    return data;
  } catch (error) {
    console.error('[v0] Error in createCreator:', error);
    return null;
  }
}

export async function updateCreator(id: string, updates: Partial<Creator>): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating creator:', error);
      return null;
    }

    // Invalidate cache
    creatorsCache = null;

    return data;
  } catch (error) {
    console.error('[v0] Error in updateCreator:', error);
    return null;
  }
}

export async function deleteCreator(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] Error deleting creator:', error);
      return false;
    }

    // Invalidate cache
    creatorsCache = null;

    return true;
  } catch (error) {
    console.error('[v0] Error in deleteCreator:', error);
    return false;
  }
}

export function invalidateCreatorsCache(): void {
  creatorsCache = null;
}
