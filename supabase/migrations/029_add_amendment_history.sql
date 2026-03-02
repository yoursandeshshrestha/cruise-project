-- Add amendment history tracking to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS amendment_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN bookings.amendment_history IS 'Stores history of amendments made to this booking';
