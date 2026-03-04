-- =============================================================================
-- ADD WEEKLY BLOCK PACKAGE DISCOUNTS TO PRICING_RULES
-- =============================================================================
-- Adds optional weekly discount fields to incentivize longer bookings
-- Discounts are percentage-based and apply to total parking price
-- Admin can set any discount to 0 to disable that tier
-- =============================================================================

-- Add weekly discount columns
ALTER TABLE pricing_rules
ADD COLUMN weekly_discount_1wk DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN weekly_discount_2wk DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN weekly_discount_3wk DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN weekly_discount_4wk DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Add check constraints to ensure valid percentage values (0-100)
ALTER TABLE pricing_rules
ADD CONSTRAINT check_weekly_discount_1wk_range CHECK (weekly_discount_1wk >= 0 AND weekly_discount_1wk <= 100),
ADD CONSTRAINT check_weekly_discount_2wk_range CHECK (weekly_discount_2wk >= 0 AND weekly_discount_2wk <= 100),
ADD CONSTRAINT check_weekly_discount_3wk_range CHECK (weekly_discount_3wk >= 0 AND weekly_discount_3wk <= 100),
ADD CONSTRAINT check_weekly_discount_4wk_range CHECK (weekly_discount_4wk >= 0 AND weekly_discount_4wk <= 100);

-- Add comments
COMMENT ON COLUMN pricing_rules.weekly_discount_1wk IS 'Percentage discount for 7-13 day bookings (e.g., 5.00 = 5% off total parking price)';
COMMENT ON COLUMN pricing_rules.weekly_discount_2wk IS 'Percentage discount for 14-20 day bookings (e.g., 10.00 = 10% off total parking price)';
COMMENT ON COLUMN pricing_rules.weekly_discount_3wk IS 'Percentage discount for 21-27 day bookings (e.g., 15.00 = 15% off total parking price)';
COMMENT ON COLUMN pricing_rules.weekly_discount_4wk IS 'Percentage discount for 28+ day bookings (e.g., 20.00 = 20% off total parking price)';
