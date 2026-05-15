-- 1. Ensure the base tables are correctly defined (idempotent)
-- Verify column names exist. If missing, this will fail with a helpful error.
-- The error "column campaign_id does not exist" suggests a join issue in the notes policy.

-- Re-enable RLS on notes table to be sure
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop problematic notes policy first
DROP POLICY IF EXISTS "Users read notes for own campaign" ON notes;

-- Corrected Policy for Notes
-- We join 'notes' to 'creators' via creator_id, then 'creators' to 'campaigns' via campaign_id.
-- This ensures we only use existing columns.
CREATE POLICY "Users read notes for own campaign" ON notes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM creators c 
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE notes.creator_id = c.id
      AND (
        cp.created_by = auth.uid() 
        OR (SELECT public.get_user_role()) IN ('admin', 'editor')
      )
    )
  );

-- Double check creators table column (just in case)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creators' AND column_name='campaign_id') THEN
    RAISE EXCEPTION 'Column campaign_id does not exist in creators table!';
  END IF;
END $$;
