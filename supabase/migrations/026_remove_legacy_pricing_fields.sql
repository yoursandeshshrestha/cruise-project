-- =============================================================================
-- Remove Legacy Pricing Fields
-- =============================================================================
-- Removes price_per_day and minimum_charge columns as they're replaced by
-- tiered pricing (base_car_price, base_van_price, additional_day_rate)
-- Created: 2026-02-27
-- =============================================================================

-- Drop the legacy columns
ALTER TABLE pricing_rules
DROP COLUMN IF EXISTS price_per_day,
DROP COLUMN IF EXISTS minimum_charge;

-- Update comments
COMMENT ON TABLE pricing_rules IS 'Parking pricing rules with tiered pricing - RLS: anon (active only), authenticated (full)';
