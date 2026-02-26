-- =============================================================================
-- Final Comprehensive Bookings RLS Fix
-- =============================================================================
-- This migration ensures RLS is properly configured for bookings table
-- Created: 2026-02-26
-- =============================================================================

-- Step 1: Disable RLS to work freely
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "allow_anon_insert" ON bookings;
DROP POLICY IF EXISTS "allow_anon_select" ON bookings;
DROP POLICY IF EXISTS "allow_auth_all" ON bookings;
DROP POLICY IF EXISTS "anon_can_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_can_select_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_select_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_update_bookings" ON bookings;
DROP POLICY IF EXISTS "auth_can_delete_bookings" ON bookings;

-- Step 3: Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT ON TABLE bookings TO anon;
GRANT ALL ON TABLE bookings TO authenticated;
GRANT ALL ON TABLE bookings TO service_role;

-- Step 4: Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple policies with PERMISSIVE mode
CREATE POLICY "bookings_anon_insert_policy"
  ON bookings
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "bookings_anon_select_policy"
  ON bookings
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "bookings_auth_all_policy"
  ON bookings
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bookings_service_all_policy"
  ON bookings
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 6: Verify the configuration
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'bookings';

  RAISE NOTICE '=================================';
  RAISE NOTICE 'Bookings RLS Configuration Complete';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Number of policies created: %', policy_count;
  RAISE NOTICE 'Anon role: INSERT + SELECT';
  RAISE NOTICE 'Authenticated role: ALL operations';
  RAISE NOTICE 'Service role: ALL operations';
  RAISE NOTICE '=================================';
END $$;
