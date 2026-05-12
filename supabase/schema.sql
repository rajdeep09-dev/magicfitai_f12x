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
  engagement_rate DECIMAL(5, 2) DEFAULT 0.00,
  email TEXT,
  phone TEXT,
  deliverable TEXT,
  approval_status TEXT NOT NULL CHECK (approval_status IN ('Ideation', 'Script Sent', 'Video Pending Approval', 'Revisions Requested', 'Approved', 'Published')) DEFAULT 'Ideation',
  progress_score INTEGER DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
  live_date DATE,
  video_link TEXT,
  published_video_link TEXT,
  
  -- Editor specific additions
  recommended_for_batch TEXT,
  draft_reel_url TEXT,
  
  -- Client approval additions
  client_approved_creator BOOLEAN DEFAULT false,
  client_approved_video BOOLEAN DEFAULT false,
  
  -- Pricing additions
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creators_campaign_id ON creators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creators_approval_status ON creators(approval_status);
CREATE INDEX IF NOT EXISTS idx_creators_platform ON creators(platform);
CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_campaign_id ON payouts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_creator_engagements_creator_id ON creator_engagements(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_engagements_metric_date ON creator_engagements(metric_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_imported_by ON bulk_imports(imported_by);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_campaign_id ON bulk_imports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_status ON bulk_imports(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_imports ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins, editors, clients can read all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

-- Campaigns RLS Policies
CREATE POLICY "Editors and admins can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "All roles can read campaigns" ON campaigns
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

CREATE POLICY "Editors and admins can update campaigns" ON campaigns
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can delete campaigns" ON campaigns
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Creators RLS Policies
CREATE POLICY "Editors and admins can create creators" ON creators
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "All roles can read creators" ON creators
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

CREATE POLICY "All roles can update creators" ON creators
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

CREATE POLICY "Editors and admins can delete creators" ON creators
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Payouts RLS Policies
CREATE POLICY "Editors and admins can create payouts" ON payouts
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "All roles can read payouts" ON payouts
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

CREATE POLICY "Editors and admins can update payouts" ON payouts
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can delete payouts" ON payouts
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Creator Engagements RLS Policies
CREATE POLICY "Editors and admins can create engagements" ON creator_engagements
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Everyone can read engagement data" ON creator_engagements
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can update engagements" ON creator_engagements
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can delete engagements" ON creator_engagements
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Bulk Imports RLS Policies
CREATE POLICY "Editors and admins can create imports" ON bulk_imports
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can read imports" ON bulk_imports
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Users can read their own imports" ON bulk_imports
  FOR SELECT USING (
    imported_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can update imports" ON bulk_imports
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can delete imports" ON bulk_imports
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Function to automatically create a profile for new users based on email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  IF new.email = 'f12x.studio@gmail.com' THEN
    assigned_role := 'editor';
  ELSIF new.email = 'ajayracharla20001@gmail.com' THEN
    assigned_role := 'editor';
  ELSIF new.email = 'sheik.farooq@pushowl.com' THEN
    assigned_role := 'client';
  ELSE
    assigned_role := 'client'; -- Default fallback
  END IF;

  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    assigned_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
