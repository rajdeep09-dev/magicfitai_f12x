-- 1. Enable RLS on all public tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly permissive policies (to be safe)
DROP POLICY IF EXISTS "Allow public read for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read for campaigns" ON campaigns;
DROP POLICY IF EXISTS "Allow public read for creators" ON creators;
DROP POLICY IF EXISTS "Allow public read for notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated insert notes" ON notes;

-- 3. Define secure policies for authenticated users
-- Profiles: Users can read all, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns: Everyone can read
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);

-- Creators: Everyone can read, authenticated can update
CREATE POLICY "Creators are viewable by everyone" ON creators FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert creators" ON creators FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update creators" ON creators FOR UPDATE USING (auth.role() = 'authenticated');

-- Notes: Authenticated users can read and insert
CREATE POLICY "Notes are viewable by authenticated" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert notes" ON notes FOR INSERT TO authenticated WITH CHECK (true);
