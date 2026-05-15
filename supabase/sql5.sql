-- 1. Create a secure, non-recursive function to fetch user roles.
-- Using SECURITY DEFINER allows it to run with the privileges of the creator, bypassing RLS checks.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Drop the existing recursive policies
DROP POLICY IF EXISTS "Admins/Editors read all profiles" ON profiles;
DROP POLICY IF EXISTS "Editors and admins can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "All roles can read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Editors and admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Editors and admins can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Editors and admins can create creators" ON creators;
DROP POLICY IF EXISTS "Everyone can read approved creators" ON creators;
DROP POLICY IF EXISTS "Editors and admins can update creators" ON creators;
DROP POLICY IF EXISTS "Editors and admins can delete creators" ON creators;
DROP POLICY IF EXISTS "Editors and admins can create payouts" ON payouts;
DROP POLICY IF EXISTS "Editors and admins can read payouts" ON payouts;
DROP POLICY IF EXISTS "Editors and admins can update payouts" ON payouts;
DROP POLICY IF EXISTS "Editors and admins can delete payouts" ON payouts;
DROP POLICY IF EXISTS "Editors and admins can create engagements" ON creator_engagements;
DROP POLICY IF EXISTS "Editors and admins can update engagements" ON creator_engagements;
DROP POLICY IF EXISTS "Editors and admins can delete engagements" ON creator_engagements;
DROP POLICY IF EXISTS "Editors and admins can create imports" ON bulk_imports;
DROP POLICY IF EXISTS "Editors and admins can read imports" ON bulk_imports;
DROP POLICY IF EXISTS "Editors and admins can update imports" ON bulk_imports;
DROP POLICY IF EXISTS "Editors and admins can delete imports" ON bulk_imports;
DROP POLICY IF EXISTS "Editors/admins insert notes" ON notes;
DROP POLICY IF EXISTS "Clients insert notes" ON notes;

-- 3. Re-create policies using the secure helper function
CREATE POLICY "Admins/Editors read all profiles" ON profiles FOR SELECT USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage campaigns" ON campaigns USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read their campaigns" ON campaigns FOR SELECT USING (created_by = auth.uid() OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage creators" ON creators USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read approved creators" ON creators FOR SELECT USING (approval_status IN ('Approved', 'Published') OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage payouts" ON payouts USING (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients read payouts" ON payouts FOR SELECT USING (campaign_id IN (SELECT id FROM campaigns WHERE created_by = auth.uid()) OR public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage engagements" ON creator_engagements USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins manage imports" ON bulk_imports USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors/admins insert notes" ON notes FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Clients insert notes" ON notes FOR INSERT WITH CHECK (public.get_user_role() = 'client');
