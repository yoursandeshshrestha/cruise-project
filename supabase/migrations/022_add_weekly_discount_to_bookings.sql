-- =============================================================================
-- ADD WEEKLY DISCOUNT FIELDS TO BOOKINGS TABLE
-- =============================================================================
-- Adds fields to track weekly discount applied at booking time
-- =============================================================================

ALTER TABLE bookings
ADD COLUMN weekly_discount_percent DECIMAL(5,2) DEFAULT 0.00 CHECK (weekly_discount_percent >= 0 AND weekly_discount_percent <= 100),
ADD COLUMN weekly_discount_amount INTEGER DEFAULT 0 CHECK (weekly_discount_amount >= 0);

-- Comments
COMMENT ON COLUMN bookings.weekly_discount_percent IS 'Weekly block package discount percentage applied (e.g., 5.00 = 5%)';
COMMENT ON COLUMN bookings.weekly_discount_amount IS 'Weekly discount amount in pence (applied before VAT)';
