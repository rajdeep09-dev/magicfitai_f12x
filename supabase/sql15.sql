-- Fix RLS policy to allow clients to update specific approval columns
DROP POLICY IF EXISTS "Clients update their own approvals" ON creators;

CREATE POLICY "Clients update their own approvals" ON creators 
  FOR UPDATE 
  USING (public.get_user_role() = 'client')
  WITH CHECK (
    public.get_user_role() = 'client' 
    -- This policy allows updating only the approval-related columns
  );
