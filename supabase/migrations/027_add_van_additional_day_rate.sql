-- =============================================================================
-- Add Van Additional Day Rate
-- =============================================================================
-- Adds additional_day_rate_van column to support different incremental rates
-- for vans vs cars (van rate is typically car rate × 1.4)
-- Created: 2026-02-27
-- =============================================================================

-- Add the new column
ALTER TABLE pricing_rules
ADD COLUMN additional_day_rate_van DECIMAL(10,2) DEFAULT 18.00;

-- Update comment
COMMENT ON TABLE pricing_rules IS 'Parking pricing rules with tiered pricing for cars and vans - RLS: anon (active only), authenticated (full)';
