-- FINAL FIX: Bookings RLS - Simple and Guaranteed to Work
-- This migration ensures anonymous users can INSERT and SELECT bookings

-- First, temporarily disable RLS to clean up
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (catch-all approach)
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_select_all_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_update_all_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_delete_all_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_full_access_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_full_access_bookings" ON bookings;
DROP POLICY IF EXISTS "allow_anon_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "allow_anon_select_bookings" ON bookings;
DROP POLICY IF EXISTS "allow_auth_select_bookings" ON bookings;
DROP POLICY IF EXISTS "allow_auth_update_bookings" ON bookings;
DROP POLICY IF EXISTS "allow_auth_delete_bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_anon" ON bookings;
DROP POLICY IF EXISTS "bookings_select_anon" ON bookings;
DROP POLICY IF EXISTS "bookings_select_authenticated" ON bookings;
DROP POLICY IF EXISTS "bookings_update_authenticated" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_authenticated" ON bookings;

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
-- Policy 1: Allow anonymous users to INSERT
CREATE POLICY "bookings_anon_insert"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Allow anonymous users to SELECT
CREATE POLICY "bookings_anon_select"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Allow authenticated users to SELECT
CREATE POLICY "bookings_auth_select"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Allow authenticated users to UPDATE
CREATE POLICY "bookings_auth_update"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow authenticated users to DELETE
CREATE POLICY "bookings_auth_delete"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE bookings IS 'Bookings - RLS enabled: anon (INSERT, SELECT), auth (full CRUD)';
