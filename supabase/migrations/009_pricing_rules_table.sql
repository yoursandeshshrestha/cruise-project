-- Update pricing_rules table to add display_order column
-- The table already exists from 001_initial_schema.sql, so we just need to modify it

-- Add display_order column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_rules' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE pricing_rules ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Drop the old priority column if it exists (replaced by display_order)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_rules' AND column_name = 'priority'
  ) THEN
    ALTER TABLE pricing_rules DROP COLUMN priority;
  END IF;
END $$;

-- Drop the old description column if it exists (not needed for now)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_rules' AND column_name = 'description'
  ) THEN
    ALTER TABLE pricing_rules DROP COLUMN description;
  END IF;
END $$;

-- The trigger and indexes already exist from 001_initial_schema.sql
-- The RLS policies already exist from 001_initial_schema.sql

-- Update the existing seed data to have display_order
UPDATE pricing_rules SET display_order = 0 WHERE name = 'Standard Pricing';

-- Add comment
COMMENT ON TABLE pricing_rules IS 'Stores parking pricing rules including seasonal and date-based pricing';
