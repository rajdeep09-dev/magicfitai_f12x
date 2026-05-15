-- 1. Helper Function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Drop all potential policies to ensure a clean state (idempotency)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.tablename);
    END LOOP;
END $$;

-- 3. Re-create policies using the secure helper function
CREATE POLICY "Admins/Editors read all profiles" ON profiles FOR SELECT USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Users read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Editors/admins manage campaigns" ON campaigns USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read their campaigns" ON campaigns FOR SELECT USING (created_by = auth.uid() OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage creators" ON creators USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read approved creators" ON creators FOR SELECT USING (approval_status IN ('Approved', 'Published') OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage payouts" ON payouts USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read payouts" ON payouts FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE created_by = auth.uid()) OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage engagements" ON creator_engagements USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Everyone reads engagements" ON creator_engagements FOR SELECT USING (true);

CREATE POLICY "Editors/admins manage imports" ON bulk_imports USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins insert notes" ON notes FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients insert notes" ON notes FOR INSERT WITH CHECK (public.get_user_role() = 'client');
CREATE POLICY "Users read notes for own campaign" ON notes FOR SELECT USING (EXISTS (SELECT 1 FROM creators c JOIN campaigns cp ON c.campaign_id = cp.id WHERE notes.creator_id = c.id));
