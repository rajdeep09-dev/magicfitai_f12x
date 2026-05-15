-- ==============================================================================
-- MASTER DATABASE SCHEMA: F12X × MAGICFIT (FINAL DEPLOYMENT VERSION)
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'editor', 'client')),
  first_name TEXT,
  company_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure a default campaign exists
INSERT INTO public.campaigns (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Campaign', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Creators Table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES public.campaigns(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  lang TEXT DEFAULT 'English',
  creator_name TEXT NOT NULL,
  platform TEXT DEFAULT 'Instagram',
  base_price NUMERIC DEFAULT 0,
  final_price NUMERIC DEFAULT 0,
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0.00,
  content_type TEXT DEFAULT 'Content',
  approval_status TEXT DEFAULT 'Brief Sent',
  draft_reel_url TEXT,
  video_link TEXT,
  published_video_link TEXT,
  is_recommended BOOLEAN DEFAULT false,
  client_approved_creator BOOLEAN DEFAULT false,
  client_approved_video BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  progress_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns safely
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS video_link TEXT;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS published_video_link TEXT;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS final_price NUMERIC DEFAULT 0;

-- 4. Campaign Budget Table
CREATE TABLE IF NOT EXISTS public.campaign_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Creator Progress Tracking
CREATE TABLE IF NOT EXISTS public.creator_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  stage TEXT DEFAULT 'Brief Sent',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Campaign Events (Calendar)
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'deadline',
  creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Normalize Existing Data (Must Run)
UPDATE public.creators 
SET approval_status = 'Brief Sent' 
WHERE approval_status IS NULL 
OR approval_status = 'Ideation';

-- 8. Setup Row Level Security (RLS) policies
DO $$ 
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['profiles', 'campaigns', 'creators', 'campaign_budget', 'creator_progress', 'campaign_events'])
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON public.%I', tbl_name);
        EXECUTE format('CREATE POLICY "authenticated_access" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', tbl_name);
    END LOOP;
END $$;
