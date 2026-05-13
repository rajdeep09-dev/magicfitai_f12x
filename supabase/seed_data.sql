-- Seed script for campaign budget and progress

-- Seed Campaign Budget
INSERT INTO public.campaign_budget (id, label, amount, spent)
VALUES ('f84f77c0-8ba8-4cbb-9005-1c76a0cb7492', 'May 2026 X f12x', 1000, 105)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  amount = EXCLUDED.amount,
  spent = EXCLUDED.spent;

-- Seed Creator Progress
INSERT INTO public.creator_progress (id, creator_id, stage, updated_at)
VALUES ('7eddd548-f885-4d55-8aba-9a04a8cde148', '84f7e3db-7407-4214-8e5a-1fc71bd5e58a', 'Content Draft', '2026-05-13 15:09:28.612508+00')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  updated_at = EXCLUDED.updated_at;
