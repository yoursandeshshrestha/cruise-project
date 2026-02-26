-- =============================================================================
-- Add Tiered Pricing Fields to Pricing Rules
-- =============================================================================
-- Adds base car/van prices and additional day rate to pricing_rules table
-- Created: 2026-02-27
-- =============================================================================

-- Add new columns for tiered pricing
ALTER TABLE pricing_rules
ADD COLUMN base_car_price DECIMAL(10,2) DEFAULT 26.00,
ADD COLUMN base_van_price DECIMAL(10,2) DEFAULT 36.00,
ADD COLUMN additional_day_rate DECIMAL(10,2) DEFAULT 13.00;

-- Update existing Standard Pricing rule with default values
UPDATE pricing_rules
SET
  base_car_price = 26.00,
  base_van_price = 36.00,
  additional_day_rate = 13.00
WHERE name = 'Standard Pricing';

-- Add comments
COMMENT ON COLUMN pricing_rules.base_car_price IS 'Base price for cars (first day of any tier)';
COMMENT ON COLUMN pricing_rules.base_van_price IS 'Base price for vans (first day of any tier)';
COMMENT ON COLUMN pricing_rules.additional_day_rate IS 'Rate charged per day beyond tier boundaries (e.g., 8 days = 7-day tier + 1 × additional_day_rate)';
