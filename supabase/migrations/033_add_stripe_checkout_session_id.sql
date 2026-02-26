-- Add stripe_checkout_session_id column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_checkout_session ON bookings(stripe_checkout_session_id);

-- Comment
COMMENT ON COLUMN bookings.stripe_checkout_session_id IS 'Stripe Checkout Session ID for redirect payment flow';
