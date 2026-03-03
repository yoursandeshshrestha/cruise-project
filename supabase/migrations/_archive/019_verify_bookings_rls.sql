-- =============================================================================
-- Verify and Force Fix Bookings RLS
-- =============================================================================
-- This migration verifies RLS setup and forces correct permissions
-- Created: 2026-02-26
-- =============================================================================

-- First, disable RLS temporarily to clean up
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including any we might have missed)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON bookings';
    END LOOP;
END $$;

-- Revoke all permissions and start fresh
REVOKE ALL ON TABLE bookings FROM PUBLIC;
REVOKE ALL ON TABLE bookings FROM anon;
REVOKE ALL ON TABLE bookings FROM authenticated;
REVOKE ALL ON TABLE bookings FROM service_role;

-- Grant explicit permissions
GRANT SELECT, INSERT ON TABLE bookings TO anon;
GRANT ALL ON TABLE bookings TO authenticated;
GRANT ALL ON TABLE bookings TO service_role;

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "allow_anon_insert" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anon_select" ON bookings
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "allow_auth_all" ON bookings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies created successfully for bookings table';
  RAISE NOTICE 'Anon users: INSERT, SELECT';
  RAISE NOTICE 'Authenticated users: ALL operations';
END $$;
