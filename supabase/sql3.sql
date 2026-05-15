-- Final Database Migration: Ensure consistent NUMERIC types
-- This migration standardizes all engagement_rate columns to NUMERIC to support large numbers (e.g., view counts)

ALTER TABLE creators 
ALTER COLUMN engagement_rate TYPE NUMERIC;

-- Ensure payment_status is correctly typed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='creators' AND column_name='payment_status') THEN
        ALTER TABLE creators ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Drop obsolete agency fee column if it exists to ensure total cleanup
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='creators' AND column_name='include_agency_fee') THEN
        ALTER TABLE creators DROP COLUMN include_agency_fee;
    END IF;
END $$;
