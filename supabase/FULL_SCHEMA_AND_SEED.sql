-- ==============================================================================
-- MASTER SCHEMA AND SEED SCRIPT
-- WARNING: This will drop existing tables and recreate them.
-- ==============================================================================

-- 1. Drop existing objects to ensure a clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS bulk_imports;
DROP TABLE IF EXISTS creator_engagements;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS creators;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS profiles;

-- 2. Create Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  company_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'client')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  base_price DECIMAL(12, 2) DEFAULT 0,
  final_price DECIMAL(12, 2) DEFAULT 0,
  approval_status TEXT DEFAULT 'Ideation',
  progress_score INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  video_link TEXT,
  published_video_link TEXT,
  is_recommended BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  client_approved_creator BOOLEAN DEFAULT false,
  client_approved_video BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- 3. RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read for campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public read for creators" ON creators FOR SELECT USING (true);
CREATE POLICY "Allow public read for notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Auth Trigger for Role Management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_role TEXT;
BEGIN
  meta_role := new.raw_user_meta_data->>'role';
  
  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    COALESCE(meta_role, 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Seed Data (Campaign & Creators)
INSERT INTO campaigns (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Campaign');

INSERT INTO creators (campaign_id, creator_name, platform, base_price, engagement_rate, video_link) VALUES 
('00000000-0000-0000-0000-000000000000', '@akarsh.lab', 'Instagram', 50.00, 3.52, 'https://www.instagram.com/akarsh.lab/'),
('00000000-0000-0000-0000-000000000000', '@harry.creates.ai', 'Instagram', 50.00, 20.50, 'https://www.instagram.com/harry.creates.ai/'),
('00000000-0000-0000-0000-000000000000', '@vik_viral', 'Instagram', 50.00, 7.94, 'https://www.instagram.com/vik_viral/');
