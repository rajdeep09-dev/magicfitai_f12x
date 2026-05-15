-- Create profiles table
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

-- Create campaigns table
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

-- Create creators table
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

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'hold', 'rejected')) DEFAULT 'pending',
  payment_method TEXT,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create creator_engagements table
CREATE TABLE IF NOT EXISTS creator_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bulk_imports table
CREATE TABLE IF NOT EXISTS bulk_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  file_name TEXT,
  error_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies Enabling
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins/Editors read all profiles" ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Campaign creators/admins manage campaigns" ON campaigns USING (created_by = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));
CREATE POLICY "Clients read their campaigns" ON campaigns FOR SELECT USING (created_by = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage creators" ON creators USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));
CREATE POLICY "Clients read approved creators" ON creators FOR SELECT USING (approval_status IN ('Approved', 'Published') OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage payouts" ON payouts USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage imports" ON bulk_imports USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Users read notes for own campaign" ON notes FOR SELECT USING (EXISTS (SELECT 1 FROM creators c JOIN campaigns cp ON c.campaign_id = cp.id WHERE notes.creator_id = c.id));
CREATE POLICY "Editors/admins insert notes" ON notes FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor'));
CREATE POLICY "Clients insert notes" ON notes FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'client');

-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS 21324
DECLARE
  assigned_role TEXT;
  meta_role TEXT;
BEGIN
  meta_role := new.raw_user_meta_data->>'role';
  IF meta_role IS NOT NULL AND meta_role IN ('editor', 'client', 'admin') THEN
    assigned_role := meta_role;
  ELSE
    assigned_role := 'client';
  END IF;
  INSERT INTO public.profiles (id, email, first_name, role) VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', assigned_role);
  RETURN new;
END;
21324 LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
