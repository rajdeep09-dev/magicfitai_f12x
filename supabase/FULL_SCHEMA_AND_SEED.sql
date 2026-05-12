-- ==============================================================================
-- MASTER DATABASE SCHEMA: F12X × MAGICFIT
-- ==============================================================================

-- 1. Clean Slate (CAUTION: Drops all existing tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS bulk_imports;
DROP TABLE IF EXISTS creator_engagements;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS creators;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS profiles;

-- 2. Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'editor', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Creators
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0.00,
  base_price DECIMAL(12, 2) DEFAULT 0.00,
  final_price DECIMAL(12, 2) DEFAULT 0.00,
  approval_status TEXT DEFAULT 'Ideation',
  progress_score INTEGER DEFAULT 0,
  video_link TEXT,
  published_video_link TEXT,
  draft_reel_url TEXT,
  is_recommended BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  client_approved_creator BOOLEAN DEFAULT false,
  client_approved_video BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Simple, non-recursive policies
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read creators" ON creators FOR SELECT USING (true);
CREATE POLICY "Auth can insert creators" ON creators FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth can update creators" ON creators FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Auth insert notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Seed Demo Data
INSERT INTO campaigns (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Campaign', 'active')
ON CONFLICT (id) DO NOTHING;
