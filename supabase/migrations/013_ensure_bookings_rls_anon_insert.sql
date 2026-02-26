-- Ensure anonymous users can insert bookings
-- This migration ensures the RLS policy for anonymous inserts is active

-- Drop and recreate the anon insert policy to ensure it's active
DROP POLICY IF EXISTS "bookings_insert_anon" ON bookings;

CREATE POLICY "bookings_insert_anon"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add comment to confirm policy
COMMENT ON POLICY "bookings_insert_anon" ON bookings IS 'Allows anonymous users to create bookings via the public booking form';
