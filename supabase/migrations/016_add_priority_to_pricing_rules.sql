-- =============================================================================
-- Add Priority to Pricing Rules
-- =============================================================================
-- Adds priority field to pricing_rules table for priority-based pricing
-- Priority 1 = Custom pricing (date-specific, higher priority)
-- Priority 2 = Standard pricing (base price, lower priority)
-- Created: 2026-02-26
-- =============================================================================

-- Add priority column
ALTER TABLE pricing_rules
ADD COLUMN priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2));

-- Set Standard Pricing to priority 2 (base pricing)
UPDATE pricing_rules
SET priority = 2
WHERE name = 'Standard Pricing';

-- Set all other existing pricing rules to priority 1 (custom pricing)
UPDATE pricing_rules
SET priority = 1
WHERE name != 'Standard Pricing';

-- Add index for priority-based queries
CREATE INDEX idx_pricing_rules_priority_dates ON pricing_rules(priority, start_date, end_date);

-- Update comments
COMMENT ON COLUMN pricing_rules.priority IS 'Priority level: 1 = custom pricing (overrides base), 2 = standard/base pricing';
