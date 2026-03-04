-- Add original booking fields to preserve initial booking data
-- These fields are set once during booking creation and never modified by amendments

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_subtotal INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_vat INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_total INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_drop_off_datetime TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_return_datetime TIMESTAMP WITH TIME ZONE;

-- Add comments to explain the purpose
COMMENT ON COLUMN bookings.original_subtotal IS 'Original booking subtotal in pence (before any amendments). Set once at booking creation, never modified.';
COMMENT ON COLUMN bookings.original_vat IS 'Original booking VAT in pence (before any amendments). Set once at booking creation, never modified.';
COMMENT ON COLUMN bookings.original_total IS 'Original booking total in pence (before any amendments). Set once at booking creation, never modified.';
COMMENT ON COLUMN bookings.original_drop_off_datetime IS 'Original booking drop-off datetime (before any amendments). Set once at booking creation, never modified.';
COMMENT ON COLUMN bookings.original_return_datetime IS 'Original booking return datetime (before any amendments). Set once at booking creation, never modified.';
