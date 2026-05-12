-- Ensure clean updates to policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins, editors, clients can read all profiles" ON profiles;

-- Profiles RLS Policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins, editors, clients can read all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor', 'client')
  );

-- Function to automatically create a profile for new users based on email or metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  meta_role TEXT;
BEGIN
  -- Check if a role was passed in raw_user_meta_data
  meta_role := new.raw_user_meta_data->>'role';

  IF meta_role IS NOT NULL AND meta_role IN ('editor', 'client', 'admin') THEN
    assigned_role := meta_role;
  -- Fallback logic for specific emails if not in metadata
  ELSIF new.email = 'f12x.studio@gmail.com' OR new.email = 'ajayracharla20001@gmail.com' THEN
    assigned_role := 'editor';
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
