-- 1. Drop existing tables if they exist to apply new schema
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS creators;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS profiles;

-- 2. Create Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'client'))
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
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
  video_link TEXT,
  is_recommended BOOLEAN DEFAULT false,
  revision_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed Default Campaign
INSERT INTO campaigns (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Campaign', 'active')
ON CONFLICT (id) DO NOTHING;
