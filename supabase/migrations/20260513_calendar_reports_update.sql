-- Run these SQL migrations in the Supabase SQL Editor

-- Normalize existing data
UPDATE creators SET approval_status = 'Sourced' 
WHERE approval_status IS NULL 
OR approval_status NOT IN ('Sourced','Outreach','Negotiating','Signed','Approved');

-- Create campaign_events table
CREATE TABLE IF NOT EXISTS campaign_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  type text, -- 'deadline' | 'shoot' | 'review' | 'publish'
  creator_id uuid references creators(id),
  notes text,
  created_at timestamptz default now()
);

ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read campaign_events" ON campaign_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can insert/update campaign_events" ON campaign_events FOR ALL USING (auth.role() = 'authenticated');
