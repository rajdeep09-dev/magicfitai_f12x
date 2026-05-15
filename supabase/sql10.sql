-- 1. Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Ensure tables exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  company_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'client')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'cancelled')) DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(12, 2),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'YouTube')),
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0.00,
  email TEXT,
  phone TEXT,
  deliverable TEXT,
  approval_status TEXT NOT NULL CHECK (approval_status IN ('Ideation', 'Script Sent', 'Video Pending Approval', 'Revisions Requested', 'Approved', 'Published')) DEFAULT 'Ideation',
  progress_score INTEGER DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
  live_date DATE,
  video_link TEXT,
  published_video_link TEXT,
  recommended_for_batch TEXT,
  draft_reel_url TEXT,
  is_recommended BOOLEAN DEFAULT false,
  client_approved_creator BOOLEAN DEFAULT false,
  client_approved_video BOOLEAN DEFAULT false,
  base_price DECIMAL(12, 2) DEFAULT 0.00,
  final_price DECIMAL(12, 2) DEFAULT 0.00,
  payment_status TEXT CHECK (payment_status IN ('pending', 'waiting_for_tolt', 'paid')) DEFAULT 'pending',
  views INTEGER DEFAULT 0,
  spend DECIMAL(12, 2) DEFAULT 0.00,
  total_reach INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Migration: Add missing columns or update types non-destructively
DO $$
BEGIN
  -- Fix engagement_rate type
  ALTER TABLE creators ALTER COLUMN engagement_rate TYPE NUMERIC USING engagement_rate::NUMERIC;
  -- Add payment_status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='payment_status') THEN
    ALTER TABLE creators ADD COLUMN payment_status TEXT CHECK (payment_status IN ('pending', 'waiting_for_tolt', 'paid')) DEFAULT 'pending';
  END IF;
END $$;

-- 4. Re-create policies (idempotent)
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.tablename);
    END LOOP;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/Editors read all profiles" ON profiles FOR SELECT USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Users read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Editors/admins manage campaigns" ON campaigns USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read their campaigns" ON campaigns FOR SELECT USING (created_by = auth.uid() OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage creators" ON creators USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read approved creators" ON creators FOR SELECT USING (approval_status IN ('Approved', 'Published') OR public.get_user_role() IN ('admin', 'editor'));
