-- Fix campaign_id constraint: make it nullable (or add a default)
ALTER TABLE public.creators ALTER COLUMN campaign_id DROP NOT NULL;

-- Ensure at least one campaign exists for the default/fallback
INSERT INTO public.campaigns (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Campaign', 'active')
ON CONFLICT (id) DO NOTHING;

-- If you prefer to have the import work without changing the column type:
-- You can set a default value for the column
ALTER TABLE public.creators ALTER COLUMN campaign_id SET DEFAULT '00000000-0000-0000-0000-000000000000';
