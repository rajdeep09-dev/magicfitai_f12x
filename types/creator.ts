export interface Creator {
  id: string;
  campaign_id: string | null;
  creator_name: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  deliverable: string;
  approval_status: 'Ideation' | 'Script Sent' | 'Video Pending Approval' | 'Revisions Requested' | 'Approved' | 'Published';
  progress_score: number;
  live_date: string | null;
  video_link: string;
  published_video_link?: string;
  
  // Editor fields
  recommended_for_batch?: string;
  draft_reel_url?: string;
  is_recommended?: boolean;
  
  // Client approval fields
  client_approved_creator?: boolean;
  client_approved_video?: boolean;
  
  // Pricing fields
  base_price?: number;
  final_price?: number;
  payment_status?: 'pending' | 'waiting_for_tolt' | 'paid';

  views: number;
  engagement_rate: number;
  followers: number;
  total_reach: number;
  spend: number;
  created_at: string;
  updated_at: string;
}
