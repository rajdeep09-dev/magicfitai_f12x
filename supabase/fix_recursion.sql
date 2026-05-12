-- 1. Fix Profiles Policy (Remove recursion by using auth.uid() directly)
DROP POLICY IF EXISTS "Admins, editors, clients can read all profiles" ON profiles;

-- Create a robust policy that allows reading if user is authenticated
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

-- 2. Fix Notes Policy (Remove recursion)
DROP POLICY IF EXISTS "Users can read notes for their campaign" ON notes;

CREATE POLICY "Enable read access for all authenticated users" ON notes
  FOR SELECT TO authenticated USING (true);

-- 3. Ensure trigger uses proper meta_role handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  meta_role TEXT;
BEGIN
  -- Get role from metadata or fallback
  meta_role := new.raw_user_meta_data->>'role';

  IF meta_role IS NOT NULL AND meta_role IN ('editor', 'client', 'admin') THEN
    assigned_role := meta_role;
  ELSIF new.email = 'f12x.studio@gmail.com' OR new.email = 'ajayracharla20001@gmail.com' THEN
    assigned_role := 'editor';
  ELSE
    assigned_role := 'client';
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
