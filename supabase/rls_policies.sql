-- Profiles RLS Policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins and editors can read all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Campaigns RLS Policies
CREATE POLICY "Editors and admins can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can read all campaigns" ON campaigns
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Clients can read campaigns they created" ON campaigns
  FOR SELECT USING (
    created_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Campaign creators and admins can update" ON campaigns
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Campaign creators and admins can delete" ON campaigns
  FOR DELETE USING (
    created_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Creators RLS Policies
CREATE POLICY "Editors and admins can create creators" ON creators
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Everyone can read approved creators" ON creators
  FOR SELECT USING (
    approval_status IN ('Approved', 'Published') OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Editors and admins can update creators" ON creators
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
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

CREATE POLICY "Editors and admins can read payouts" ON payouts
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Clients can read their own campaign payouts" ON payouts
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
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
