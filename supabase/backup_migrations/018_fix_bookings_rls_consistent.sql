-- Fix Bookings Table RLS to match consistent pattern
-- Ensure all tables use the same role-based policy pattern

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can read bookings" ON bookings;
DROP POLICY IF EXISTS "Only admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Only admins can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;

-- Policy 1: Anonymous users can create bookings (public booking form)
CREATE POLICY "bookings_insert_anon"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can view bookings (for booking lookup by reference/email)
CREATE POLICY "bookings_select_anon"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Authenticated users can view all bookings
CREATE POLICY "bookings_select_authenticated"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users can update bookings
CREATE POLICY "bookings_update_authenticated"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can delete bookings
CREATE POLICY "bookings_delete_authenticated"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Update comment
COMMENT ON TABLE bookings IS 'Bookings table - RLS enabled with anon (create/read) and authenticated (full CRUD) policies';
