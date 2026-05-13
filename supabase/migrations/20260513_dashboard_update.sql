-- Run these SQL migrations in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS creators (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  platform text,
  base_price numeric default 0,
  followers integer default 0,
  content_type text,
  approval_status text default 'Sourced',
  notes text,
  avatar_url text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key references auth.users(id),
  email text,
  role text default 'client',
  first_name text,
  company_name text,
  is_active boolean default true
);

CREATE TABLE IF NOT EXISTS campaign_budget (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount numeric not null,
  spent numeric default 0,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS creator_progress (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id),
  stage text,
  notes text,
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_progress ENABLE ROW LEVEL SECURITY;

-- Add Policies (simplistic for now as requested: authenticated users can read)
CREATE POLICY "authenticated users can read creators" ON creators FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can read profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can read campaign_budget" ON campaign_budget FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can read creator_progress" ON creator_progress FOR SELECT USING (auth.role() = 'authenticated');

-- Additional policies for Editor updates (assuming editors need to write)
CREATE POLICY "authenticated users can insert/update creators" ON creators FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can insert/update campaign_budget" ON campaign_budget FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can insert/update creator_progress" ON creator_progress FOR ALL USING (auth.role() = 'authenticated');
