-- =============================================================================
-- Add Reason Field to Pricing Rules
-- =============================================================================
-- Adds reason field to explain custom pricing (e.g., "Peak season rates")
-- Created: 2026-02-26
-- =============================================================================

-- Add reason column
ALTER TABLE pricing_rules
ADD COLUMN reason TEXT;

-- Update comments
COMMENT ON COLUMN pricing_rules.reason IS 'Optional explanation for custom pricing (e.g., "Christmas peak season", "Summer holidays")';
