// Creator data utilities and helpers

export interface Creator {
  id: string;
  creator_name: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  followers: number;
  engagement_rate: number;
  approval_status: string;
  payout_status: 'pending' | 'paid' | 'processing';
  active_campaign: boolean;
  views: number;
  spend: number;
  campaign_name?: string;
}

export interface CreatorMetrics {
  total_approved: number;
  active_on_campaign: number;
  avg_engagement: number;
  total_followers: number;
  total_reach: number;
}

/**
 * Get all approved creators
 */
export function getApprovedCreators(creators: Creator[]): Creator[] {
  return creators.filter(
    (c) => c.approval_status === 'Approved' || c.approval_status === 'Published'
  );
}

/**
 * Get creators actively working on campaigns
 */
export function getActiveCreators(creators: Creator[]): Creator[] {
  return creators.filter((c) => c.active_campaign === true);
}

/**
 * Calculate engagement score for a creator
 */
export function calculateEngagementScore(creator: Creator): number {
  const followerWeight = 0.3;
  const engagementWeight = 0.5;
  const viewWeight = 0.2;

  const normalizedFollowers = Math.min(creator.followers / 100000, 1);
  const normalizedEngagement = creator.engagement_rate / 10;
  const normalizedViews = Math.min(creator.views / 500000, 1);

  return (
    normalizedFollowers * followerWeight +
    normalizedEngagement * engagementWeight +
    normalizedViews * viewWeight
  ) * 100;
}

/**
 * Get creators by platform
 */
export function getCreatorsByPlatform(
  creators: Creator[],
  platform: string
): Creator[] {
  return creators.filter((c) => c.platform === platform);
}

/**
 * Get creators by payout status
 */
export function getCreatorsByPayoutStatus(
  creators: Creator[],
  status: 'pending' | 'paid' | 'processing'
): Creator[] {
  return creators.filter((c) => c.payout_status === status);
}

/**
 * Calculate metrics for creators
 */
export function calculateCreatorMetrics(creators: Creator[]): CreatorMetrics {
  const approvedCreators = getApprovedCreators(creators);
  const activeCreators = getActiveCreators(creators);

  const avgEngagement =
    creators.length > 0
      ? creators.reduce((sum, c) => sum + c.engagement_rate, 0) / creators.length
      : 0;

  const totalFollowers = creators.reduce((sum, c) => sum + c.followers, 0);
  const totalReach = creators.reduce((sum, c) => sum + c.views, 0);

  return {
    total_approved: approvedCreators.length,
    active_on_campaign: activeCreators.length,
    avg_engagement: parseFloat(avgEngagement.toFixed(1)),
    total_followers: totalFollowers,
    total_reach: totalReach,
  };
}

/**
 * Sort creators by specified criteria
 */
export function sortCreators(
  creators: Creator[],
  sortBy: 'engagement' | 'followers' | 'name' | 'reach'
): Creator[] {
  const sorted = [...creators];

  switch (sortBy) {
    case 'engagement':
      return sorted.sort((a, b) => b.engagement_rate - a.engagement_rate);
    case 'followers':
      return sorted.sort((a, b) => b.followers - a.followers);
    case 'name':
      return sorted.sort((a, b) => a.creator_name.localeCompare(b.creator_name));
    case 'reach':
      return sorted.sort((a, b) => b.views - a.views);
    default:
      return sorted;
  }
}

/**
 * Search creators by name or platform
 */
export function searchCreators(creators: Creator[], query: string): Creator[] {
  const lowercaseQuery = query.toLowerCase();

  return creators.filter(
    (c) =>
      c.creator_name.toLowerCase().includes(lowercaseQuery) ||
      c.platform.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get creator ROI (Return on Investment)
 */
export function calculateROI(creator: Creator): number {
  if (creator.spend === 0) return 0;
  return parseFloat(((creator.views / creator.spend) * 100).toFixed(2));
}

/**
 * Get creator cost per engagement
 */
export function calculateCostPerEngagement(creator: Creator): number {
  const totalEngagements = (creator.views * creator.engagement_rate) / 100;
  if (totalEngagements === 0) return 0;
  return parseFloat((creator.spend / totalEngagements).toFixed(2));
}
