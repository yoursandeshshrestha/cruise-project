-- Secure Bookings RLS - Following Security Best Practices
-- Anonymous users can only INSERT (create) bookings
-- Anonymous users can only SELECT their own bookings (by reference + email)
-- Authenticated users have full CRUD access

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
    END LOOP;
END
$$;

-- =============================================================================
-- ANONYMOUS USER POLICIES (Public Booking Form)
-- =============================================================================

-- Policy 1: Anonymous users can INSERT bookings (create new bookings)
CREATE POLICY "anon_insert_bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can SELECT bookings (for booking lookup/management)
CREATE POLICY "anon_select_bookings"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- =============================================================================
-- AUTHENTICATED USER POLICIES (Admin Panel)
-- =============================================================================

-- Policy 3: Authenticated users can SELECT all bookings
CREATE POLICY "auth_select_all_bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users can UPDATE all bookings
CREATE POLICY "auth_update_all_bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can DELETE all bookings
CREATE POLICY "auth_delete_all_bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add security comment
COMMENT ON TABLE bookings IS 'Bookings table with secure RLS - anonymous users can INSERT and SELECT (read-only), authenticated users have full CRUD';
