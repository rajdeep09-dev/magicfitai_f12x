-- 1. Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Drop all potential policies to ensure a clean state
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.tablename);
    END LOOP;
END $$;

-- 3. Standardized Policies (Explicitly including 'admin', 'editor', 'client')
-- Profiles
CREATE POLICY "Admins/Editors/Clients read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR public.get_user_role() IN ('admin', 'editor'));

-- Campaigns
CREATE POLICY "Admins/Editors manage campaigns" ON campaigns USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read campaigns" ON campaigns FOR SELECT USING (created_by = auth.uid() OR public.get_user_role() IN ('admin', 'editor'));

-- Creators
CREATE POLICY "Admins/Editors manage creators" ON creators USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read creators" ON creators FOR SELECT USING (true); 

-- Budget & Progress
CREATE POLICY "Admins/Editors manage budget" ON campaign_budget USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read budget" ON campaign_budget FOR SELECT USING (true);
CREATE POLICY "Admins/Editors manage progress" ON creator_progress USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read progress" ON creator_progress FOR SELECT USING (true);

-- Notes
CREATE POLICY "Everyone read/write notes" ON notes FOR ALL USING (public.get_user_role() IN ('admin', 'editor', 'client'));

-- Create policy for calendar events
CREATE POLICY "Everyone read events" ON campaign_events FOR SELECT USING (true);
CREATE POLICY "Admins/Editors manage events" ON campaign_events USING (public.get_user_role() IN ('admin', 'editor'));
