-- DANGER: This will wipe all creator and campaign data.
DELETE FROM creators;
DELETE FROM campaigns;
DELETE FROM notes;

-- Create the default campaign so FK constraints pass
INSERT INTO campaigns (id, name, status, created_by)
SELECT 
  '00000000-0000-0000-0000-000000000000', 
  'Initial Campaign', 
  'active', 
  id
FROM auth.users 
LIMIT 1
ON CONFLICT (id) DO NOTHING;
