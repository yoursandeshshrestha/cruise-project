-- =============================================================================
-- Fix Bookings RLS - Final Fix
-- =============================================================================
-- Completely reset and fix bookings RLS to allow anonymous booking creation
-- Created: 2026-02-26
-- =============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "anon_can_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_can_select_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_select_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_update_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_delete_bookings" ON bookings;

-- Revoke and re-grant permissions
REVOKE ALL ON TABLE bookings FROM anon;
REVOKE ALL ON TABLE bookings FROM authenticated;

GRANT SELECT, INSERT ON TABLE bookings TO anon;
GRANT ALL ON TABLE bookings TO authenticated;

-- Recreate policies
CREATE POLICY "anon_can_insert_bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_can_select_bookings"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "auth_can_select_bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_update_bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_can_delete_bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);
